import unittest
import json
from unittest.mock import patch
from backend.app import create_app
from backend.database import SessionLocal, init_db
from backend.models import Base, Plan, Questionnaire, Payment, CoachingAccess, Article, EmailSubscription

class ComprehensiveSystemTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        init_db()

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_1_plans_api(self):
        """Test plans endpoint returns plans with server-side prices"""
        response = self.client.get("/api/plans")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(len(data) >= 3)
        self.assertIn("name", data[0])

    def test_2_questionnaire_creation_with_email(self):
        """Test submitting questionnaire saves email, phone, and generates client ID"""
        payload = {
            "name": "Ahmed Mohamed",
            "whatsapp": "252634445555",
            "email": "ahmed.mohamed@example.com",
            "gender": "Male",
            "goal": "Muruq-dhissid",
            "weight": 78,
            "unit": "kg",
            "height": 180,
            "height_unit": "cm",
            "challenge": "Wakhti la'aan"
        }
        res = self.client.post("/api/questionnaires", json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertTrue(data.get("success"))
        self.assertIsNotNone(data.get("questionnaire_id"))
        self.assertEqual(data["data"]["email"], "ahmed.mohamed@example.com")
        self.assertTrue(data.get("client_id", "").startswith("CLI-"))

    def test_3_payment_creation_server_price_security(self):
        """Test backend retrieves real DB price, records email, and enforces price"""
        q_res = self.client.post("/api/questionnaires", json={
            "name": "Khadar Ali",
            "whatsapp": "252659998888",
            "email": "khadar.ali@example.com",
            "gender": "Male"
        })
        q_id = json.loads(q_res.data)["questionnaire_id"]

        with patch("backend.services.sifalo_service.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.content = b'{"code": 601, "response": "Transaction Processed", "sid": "SIF_TEST_101"}'
            mock_post.return_value.json.return_value = {
                "code": 601,
                "response": "Transaction Processed",
                "sid": "SIF_TEST_101"
            }

            pay_payload = {
                "plan_id": "plan-premium",
                "questionnaire_id": q_id,
                "payment_method": "Zaad",
                "payment_phone": "252631112233",
                "currency": "USD",
                "amount": 1  # Malicious price attempt
            }
            res = self.client.post("/api/payments/create", json=pay_payload)
            self.assertEqual(res.status_code, 200)
            data = json.loads(res.data)
            self.assertTrue(data["success"])
            self.assertEqual(data["status"], "PAID")
            self.assertEqual(data["amount"], 20.0) # Server strictly charged $20
            self.assertIsNotNone(data.get("access_code"))

    def test_4_different_whatsapp_and_payment_phones(self):
        """Test system correctly distinguishes WhatsApp phone from Payment phone"""
        q_res = self.client.post("/api/questionnaires", json={
            "name": "Sahra Hassan",
            "whatsapp": "252651111111",
            "email": "sahra@example.com",
            "gender": "Female"
        })
        q_id = json.loads(q_res.data)["questionnaire_id"]

        with patch("backend.services.sifalo_service.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.content = b'{"code": 601, "response": "Processed", "sid": "SIF_DIFF_PHONE"}'
            mock_post.return_value.json.return_value = {"code": 601, "response": "Processed", "sid": "SIF_DIFF_PHONE"}

            pay_payload = {
                "plan_id": "plan-standard",
                "questionnaire_id": q_id,
                "payment_method": "Zaad",
                "payment_phone": "252639990000",
                "currency": "USD"
            }
            res = self.client.post("/api/payments/create", json=pay_payload)
            self.assertEqual(res.status_code, 200)
            data = json.loads(res.data)
            self.assertEqual(data["whatsapp_phone"], "252651111111")
            self.assertEqual(data["payment_phone"], "252639990000")

    def test_5_sifalo_pending_and_verify_flow(self):
        """Test pending USSD push and subsequent verify flow"""
        q_res = self.client.post("/api/questionnaires", json={
            "name": "Hodan Warsame",
            "whatsapp": "252637776655",
            "email": "hodan@example.com",
            "gender": "Female",
            "goal": "Jidh-Hagaajin"
        })
        q_id = json.loads(q_res.data)["questionnaire_id"]

        with patch("backend.services.sifalo_service.requests.post") as mock_init_post:
            mock_init_post.return_value.status_code = 200
            mock_init_post.return_value.content = b'{"code": 0, "response": null, "sid": "SIF_PENDING_001"}'
            mock_init_post.return_value.json.return_value = {
                "code": 0,
                "response": None,
                "sid": "SIF_PENDING_001"
            }

            init_res = self.client.post("/api/payments/create", json={
                "plan_id": "plan-vip-transformation",
                "questionnaire_id": q_id,
                "payment_method": "eDahab",
                "payment_phone": "252654443322",
                "currency": "USD"
            })
            self.assertEqual(init_res.status_code, 200)
            init_data = json.loads(init_res.data)
            self.assertTrue(init_data["pending"])
            order_id = init_data["order_id"]

        # Now verify after customer entered PIN
        with patch("backend.services.sifalo_service.requests.post") as mock_verify_post:
            mock_verify_post.return_value.status_code = 200
            mock_verify_post.return_value.content = b'{"code": 601, "response": "Processed", "sid": "SIF_PENDING_001"}'
            mock_verify_post.return_value.json.return_value = {
                "code": 601,
                "response": "Processed",
                "sid": "SIF_PENDING_001"
            }

            verify_res = self.client.post("/api/payments/verify", json={"order_id": order_id})
            self.assertEqual(verify_res.status_code, 200)
            v_data = json.loads(verify_res.data)
            self.assertTrue(v_data["success"])
            self.assertEqual(v_data["status"], "PAID")
            self.assertIsNotNone(v_data.get("access_code"))

    def test_6_idempotency_duplicate_protection(self):
        """Test duplicate verify calls do not generate duplicate coaching access records"""
        payment = self.db.query(Payment).filter_by(payment_status="PAID").first()
        self.assertIsNotNone(payment)
        initial_access_count = self.db.query(CoachingAccess).filter_by(order_id=payment.order_id).count()
        self.assertEqual(initial_access_count, 1)

        res = self.client.post("/api/payments/verify", json={"order_id": payment.order_id})
        self.assertEqual(res.status_code, 200)
        after_access_count = self.db.query(CoachingAccess).filter_by(order_id=payment.order_id).count()
        self.assertEqual(after_access_count, 1)

    def test_7_admin_shilling_plan_creation_and_payment(self):
        """Test admin creating a plan priced in Shillings and user paying in SLSH"""
        create_plan_res = self.client.post("/api/plans", json={
            "name": "Shilling Transformation",
            "tier": "Shilling Plan",
            "price": None,
            "price_cash": 350000,
            "duration": "2 Bilood",
            "features": ["Feature A", "Feature B"]
        })
        self.assertEqual(create_plan_res.status_code, 201)
        plan_id = json.loads(create_plan_res.data)["id"]

        q_res = self.client.post("/api/questionnaires", json={
            "name": "Jama Hassan",
            "whatsapp": "252634449988",
            "email": "jama@example.com",
            "gender": "Male"
        })
        q_id = json.loads(q_res.data)["questionnaire_id"]

        with patch("backend.services.sifalo_service.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.content = b'{"code": 601, "response": "Transaction Processed", "sid": "SIF_SLSH_TEST"}'
            mock_post.return_value.json.return_value = {
                "code": 601,
                "response": "Transaction Processed",
                "sid": "SIF_SLSH_TEST"
            }

            pay_res = self.client.post("/api/payments/create", json={
                "plan_id": plan_id,
                "questionnaire_id": q_id,
                "payment_method": "Zaad",
                "payment_phone": "252634449988",
                "currency": "SLSH"
            })
            self.assertEqual(pay_res.status_code, 200)
            pay_data = json.loads(pay_res.data)
            self.assertEqual(pay_data["amount"], 350000.0)
            self.assertEqual(pay_data["currency"], "SLSH")

    def test_8_blog_article_creation_draft_and_published(self):
        """Test creating draft vs published articles and verify public visibility filtering"""
        # 1. Create a draft article
        draft_res = self.client.post("/api/articles", json={
            "title": "Secret Workout Technique (Draft)",
            "content": "This is unpublished draft content.",
            "status": "draft"
        })
        self.assertEqual(draft_res.status_code, 201)
        draft_slug = json.loads(draft_res.data)["slug"]

        # 2. Create a published article
        pub_res = self.client.post("/api/articles", json={
            "title": "Nutrition Fundamentals 2026",
            "content": "Published nutrition guide.",
            "status": "published"
        })
        self.assertEqual(pub_res.status_code, 201)
        pub_slug = json.loads(pub_res.data)["slug"]

        # 3. Public GET /api/articles must only return published articles (draft hidden)
        public_articles_res = self.client.get("/api/articles")
        self.assertEqual(public_articles_res.status_code, 200)
        pub_articles = json.loads(public_articles_res.data)
        slugs = [a["slug"] for a in pub_articles]
        self.assertIn(pub_slug, slugs)
        self.assertNotIn(draft_slug, slugs) # Draft must NOT appear in public list!

    def test_9_email_subscription_and_duplicate_prevention(self):
        """Test subscribing via email and preventing duplicate subscription records"""
        email = "subscriber.test@example.com"
        # First subscription
        res1 = self.client.post("/api/subscriptions", json={"email": email})
        self.assertIn(res1.status_code, [200, 201])
        data1 = json.loads(res1.data)
        self.assertTrue(data1["success"])

        # Second subscription with same email
        res2 = self.client.post("/api/subscriptions", json={"email": email})
        self.assertEqual(res2.status_code, 200)
        data2 = json.loads(res2.data)
        self.assertTrue(data2["success"])

        # Verify only 1 record exists for this email
        sub_count = self.db.query(EmailSubscription).filter_by(email=email).count()
        self.assertEqual(sub_count, 1)

    def test_10_admin_all_collected_emails(self):
        """Test admin all-emails aggregation collects questionnaire and subscriber emails"""
        res = self.client.get("/api/admin/all-emails")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("emails", data)
        self.assertTrue(data["total_count"] >= 1)
        collected_emails = [e["email"] for e in data["emails"]]
        self.assertIn("ahmed.mohamed@example.com", collected_emails)
        self.assertIn("subscriber.test@example.com", collected_emails)

if __name__ == "__main__":
    unittest.main()
