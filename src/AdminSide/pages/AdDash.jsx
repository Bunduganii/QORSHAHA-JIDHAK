import React from "react";
import "./../pages/admin-dash.css";


const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="logo-area">
          <h2>Qorshaha Jidhka</h2>
          <p>ELITE PERFORMANCE</p>
        </div>

        <nav className="sidebar-nav">
          <a href="/admin-dashboard" className="admin-nav-item">
            <span className="material-symbols-outlined">Dashboard</span>
            
          </a>

          <a href="/" className="admin-nav-item active">
            <span className="material-symbols-outlined">payments</span>
            
          </a>

          <a href="/" className="admin-nav-item">
            <span className="material-symbols-outlined">Users</span>
            
          </a>

          <a href="/" className="admin-nav-item">
            <span className="material-symbols-outlined">
              video library
            </span>
            
          </a>

          <a href="/" className="admin-nav-item">
            <span className="material-symbols-outlined">Socials</span>
            
          </a>

          <a href="/" className="admin-nav-item">
            <span className="material-symbols-outlined"> User Requests</span>
           
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="program-btn">
            <span className="material-symbols-outlined"> New Program</span>
            
          </button>

          <div className="coach-profile">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300"
              alt=""
            />

            <div>
              <h4>Coach Naasir</h4>
              <p>Head Performance Coach</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="top-left">
            <h1>FITNESS ADMIN</h1>

            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search data points..." />
            </div>
          </div>

          <div className="top-right">
            <button className="icon-btn">
              <span className="material-symbols-outlined">
                notifications
              </span>
              {/* <div className="notification-dot"></div> */}
            </button>
          </div>
          <div className="divider"></div>
           <button className="icon-btn">
              <span className="material-symbols-outlined">settings</span>
            </button>
             <div className="divider"></div>
           <div className="admin-status">
              <span>Admin Status</span>

              <div className="admin-avatar">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300"
                  alt=""
                />
              </div>
            </div>
        </header>

        {/* CONTENT */}
        <div className="dashboard-content">
          {/* HERO */}
          <section className="admin-hero">
            <h2>
              Financial <span>Intelligence</span>
            </h2>

            <p>
              Real-time revenue monitoring and performance analytics for the
              Neon Kinetic ecosystem.
            </p>
          </section>

          {/* STATS */}
          <section className="stats-grid">
            <div className="glass-card revenue-card">
              <p className="card-label">TOTAL REVENUE</p>

              <div className="card-value">
                <h3>$142,850</h3>
                <span>+12.4%</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>

            <div className="glass-card subs-card">
              <p className="card-label">ACTIVE SUBS</p>

              <div className="card-value">
                <h3>1,248</h3>
                <span>+5.2%</span>
              </div>

              <div className="mini-bars">
                <div></div>
                <div></div>
                <div></div>
                <div className="admin-inactive"></div>
              </div>
            </div>

            <div className="glass-card churn-card">
              <p className="card-label">CHURN RATE</p>

              <div className="card-value">
                <h3>2.4%</h3>
                <span className="error">-0.8%</span>
              </div>

              <div className="tiny-chart">
                <span></span>
                <span></span>
                <span></span>
                <span className="admin-active"></span>
                <span className="active low"></span>
              </div>
            </div>
          </section>

          {/* CHART */}
          <section className="chart-section glass-card">
            <div className="chart-top">
              <div>
                <h3>Revenue Growth</h3>
                <p>6-MONTH TRAJECTORY</p>
              </div>

              <div className="chart-buttons">
                <button className="active-btn">Monthly</button>
                <button>Quarterly</button>
              </div>
            </div>

            <div className="chart-area">
              <svg viewBox="0 0 1000 300">
                <line x1="0" y1="50" x2="1000" y2="50" />
                <line x1="0" y1="150" x2="1000" y2="150" />
                <line x1="0" y1="250" x2="1000" y2="250" />

                <defs>
                  <linearGradient
                    id="areaGrad"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#00d0ff"
                      stopOpacity="0.3"
                    />

                    <stop
                      offset="100%"
                      stopColor="#00d0ff"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0,250 L100,230 L250,180 L400,210 L600,100 L800,120 L1000,40 L1000,300 L0,300 Z"
                  fill="url(#areaGrad)"
                />

                <path
                  d="M0,250 L100,230 L250,180 L400,210 L600,100 L800,120 L1000,40"
                  fill="none"
                  stroke="#00d0ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="neon-line"
                />

                <circle
                  cx="600"
                  cy="100"
                  r="6"
                  fill="#0f1f23"
                  stroke="#00d0ff"
                  strokeWidth="2"
                />

                <circle
                  cx="1000"
                  cy="40"
                  r="6"
                  fill="#0f1f23"
                  stroke="#00d0ff"
                  strokeWidth="2"
                />
              </svg>

              <div className="chart-tooltip">
                <p>AUGUST REVENUE</p>
                <h4>$32,440</h4>
              </div>
            </div>

            <div className="months">
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
            </div>
          </section>

          {/* TABLE */}
          <section className="table-section">
            <div className="table-header">
              <h3>Recent Transactions</h3>
              <a href="/">Export CSV</a>
            </div>

            <div className="table-wrapper glass-card">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Program</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">JD</div>

                        <div>
                          <h4>Julian D.</h4>
                          <p>julian.d@example.com</p>
                        </div>
                      </div>
                    </td>

                    <td>Kinetic Hybrid v2</td>
                    <td>$249.00</td>
                    <td>Aug 24, 2024</td>

                    <td>
                      <span className="admin-status-success">
                        <div></div>
                        Success
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar yellow">SK</div>

                        <div>
                          <h4>Sasha K.</h4>
                          <p>sk@webmail.io</p>
                        </div>
                      </div>
                    </td>

                    <td>Elite 1-on-1 Coaching</td>
                    <td>$1,200.00</td>
                    <td>Aug 23, 2024</td>

                    <td>
                      <span className="status pending">
                        <div></div>
                        Pending
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">MR</div>

                        <div>
                          <h4>Marcus R.</h4>
                          <p>m.reid@gmail.com</p>
                        </div>
                      </div>
                    </td>

                    <td>Bio-Mech Basic Bundle</td>
                    <td>$89.00</td>
                    <td>Aug 22, 2024</td>

                    <td>
                      <span className="admin-status-success">
                        <div></div>
                        Success
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="admin-footer">
          <p>
            © 2024 Neon Kinetic. System Status:
            <span> Operational</span>
          </p>

          <div className="admin-footer-links">
            <a href="/">Support</a>
            <a href="/">Privacy Policy</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;