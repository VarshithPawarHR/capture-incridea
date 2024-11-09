import FallingClipart from "../FallingClipart";
import CapturePageCard from "./CapturePageCard";

const CapturesComponent = () => {
  // Array of card data
  const cards = [
    
    {
      title: "Events",
      description: "Discover memories from our amazing events.",
      imagePath: "/images/event-bg1.jpg",
      link: "/captures/events",
    },
    {
      title: "Pronight",
      description: "Explore wonderfull Captures from pronight",
      imagePath: "/images/event-bg2.png",
      link: "/captures/pronight",
    },
    {
      title: "Your Snaps",
      description: "Find your favorite snaps captured just for you.",
      imagePath: "/images/snaps.png",
      link: "/captures/your-snaps",
    },
    {
      title: "Behind Incridea",
      description: "Explore the behind-the-scenes moments.",
      imagePath: "/images/admin-bg.png",
      link: "/captures/behindincridea",
    },
    
  ];

  return (
    <div>
      <FallingClipart />
      <div
        className="min-h-screen bg-cover bg-center flex flex-col items-center justify-start p-8 z-30"
        style={{ backgroundImage: "url('')" }}
      >
        <h1 className="text-6xl md:text-8xl text-white font-Hunters mb-12 p-8 z-30">Captures</h1>

        <div className="flex flex-col md:flex-row gap-12 flex-wrap justify-center z-30">
          {/* Map through the cards array to render CapturePageCard components */}
          {cards.map((card, index) => (
            <CapturePageCard
              key={index}  // Use index as a key for mapping
              title={card.title}
              description={card.description}
              imagePath={card.imagePath}
              link={card.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapturesComponent;
