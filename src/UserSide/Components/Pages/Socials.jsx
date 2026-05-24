import { FaFacebook, FaYoutube } from "react-icons/fa";
import "./../Pages/Socials.css";
import { Music2 } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { MapPin } from "lucide-react";
import { Mail } from "lucide-react";
import { Clock3 } from "lucide-react";
import Navbar from "./Navbar";


const Socials = () => {
  const socialLinks = [
    {
      magac: "YouTube",
      faahfaahin: "Daawo casharro tababar",
      icon: <FaYoutube />,
      link: "https://youtube.com",
      btn: "Daawo",
    },
    {
      magac: "TikTok",
      faahfaahin: "Muuqaallo gaagaaban",
      icon: <Music2 />,
      link: "https://tiktok.com",
      btn: "Raac",
    },
    {
      magac: "WhatsApp",
      faahfaahin: "La hadal toos",
      icon: <MessageCircle />,
      link: "https://wa.me/252000000000",
      btn: "Fariin",
    },
    {
      magac: "Facebook",
      faahfaahin: "Bulshada kooxda",
      icon: <FaFacebook />,
      link: "https://facebook.com",
      btn: "Gal",
    },
  ];

  return (
    <section className="bulsho-page">
      <Navbar/>
      <div className="bulsho-hero">
        <span className="hero-tag">BULSHADA COACH NASIR</span>

        <h1>
          COACH <span>NASIR</span>
        </h1>

        <h3>QORSHAHA JIDHKA</h3>

        <p>
          Ku xidhnow dhammaan baraha bulshada, hel casharro, fariimo iyo
          hagitaan toos ah.
        </p>
      </div>

      <div className="bulsho-main">
        <div className="fariin-box">
          <h2>DIR FARIIN</h2>

          <input type="text" placeholder="Magacaaga" />
          <input type="email" placeholder="Email-kaaga" />
          <textarea placeholder="Qor fariintaada..." rows="5"></textarea>

          <button>Dir Hadda</button>
        </div>

        <div className="social-grid">
          {socialLinks.map((item, index) => (
            <div key={index} className="social-card">
              <div className="social-icon">{item.icon}</div>

              <h3>{item.magac}</h3>
              <p>{item.faahfaahin}</p>

              <button onClick={() => window.open(item.link, "_blank")}>
                {item.btn}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="xog-box">
        <div className="xog-left">
          <img src="/images/female.jpg" alt="coach" />
        </div>

        <div className="xog-right">
          <h2>
            COACH <span>NASIR</span>
          </h2>

          <div className="xog-item">
            <MapPin />
            <p>Hargeysa, Somaliland</p>
          </div>

          <div className="xog-item">
            <Mail />
            <p>coachnasir@gmail.com</p>
          </div>

          <div className="xog-item">
            <Clock3 />
            <p>05:00 - 22:00</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Socials;