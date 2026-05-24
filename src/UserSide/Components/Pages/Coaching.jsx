import "./../Pages/Socials.css";
import Navbar from "./../Pages/Navbar"

import { Search, Bell, Bookmark } from "lucide-react";

const Coaching = () => {
  const videos = [
    {
      title: "Murqo Lug & Xoog",
      cat: "XOOG",
      time: "14:22",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      title: "Dhaqdhaqaaq Garbo",
      cat: "DHAQDHAQAAQ",
      time: "08:45",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    },
    {
      title: "Diyaarinta Maskaxda",
      cat: "MASKAX",
      time: "22:10",
      url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    },
    {
      title: "Xawaare Sare",
      cat: "MURUQ",
      time: "12:05",
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    },
    {
      title: "Culeys Gacan",
      cat: "XOOG",
      time: "15:50",
      url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
    },
    {
      title: "Tababar Guud",
      cat: "TABABAR",
      time: "30:00",
      url: "https://www.youtube.com/watch?v=tgbNymZ7vqY",
    },
  ];

  const getYoutubeId = (url) => {
    const reg = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    return url.match(reg)?.[1];
  };

  return (
    <section className="coach-wrap">
      <Navbar/>
      {/* top bar */}
      <div className="coach-top">
        <div className="coach-logo">QORSHAHA JIDHKA</div>

        <div className="coach-search">
          <Search size={18} />
          <input type="text" placeholder="Raadi casharro..." />
        </div>

        <Bell className="top-icon" />
      </div>

      {/* hero */}
      <div className="coach-hero">
        <div className="hero-overlay">
          <span className="hero-tag">COACH NASIR</span>
          <h1>MAKTABADDA VIDEO</h1>
          <p>
            Daawo dhammaan casharrada tababarka, murqo dhiska iyo caafimaadka.
          </p>
        </div>
      </div>

      {/* filters */}
      <div className="filter-row">
        <button className="active-filter">Dhammaan</button>
        <button>Xoog</button>
        <button>Murqo</button>
        <button>Dhaqdhaqaaq</button>
        <button>Maskax</button>
      </div>

      {/* videos */}
      <div className="video-grid">
        {videos.map((video, index) => {
          const id = getYoutubeId(video.url);
          const thumb = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

          return (
            <div
              className="video-card"
              key={index}
              onClick={() => window.open(video.url, "_blank")}
            >
              <div className="video-thumb">
                <img src={thumb} alt={video.title} />
                <span>{video.time}</span>
              </div>

              <div className="video-body">
                <div className="video-head">
                  <small>{video.cat}</small>
                  <Bookmark size={16} />
                </div>

                <h3>{video.title}</h3>
                <p>Daawo casharka YouTube-ka coach-ka.</p>

                <div className="video-foot">
                  <img src="/images/female.jpg" alt="coach" />
                  <span>Coach Nasir</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Coaching;