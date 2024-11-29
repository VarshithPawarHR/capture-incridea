import Image from "next/image";

interface CapturePopupProps {
  selectedImage: string | null;
  handleClosePopup: () => void;
  handleDownload: (imageUrl: string) => void;
  openRemovalPopup: (imageUrl: string) => void;
  cookieId: string;
}

const CapturePopup: React.FC<CapturePopupProps> = ({
  selectedImage,
  handleClosePopup,
  handleDownload,
  openRemovalPopup,
}) => {
  if (!selectedImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col items-center justify-center z-30"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-black p-6 rounded-lg shadow-lg max-w-xs sm:max-w-md w-full z-30">
        <div className="flex">
          <h2 className="text-2xl w-full text-center font-bold text-white">
            Add Capture
          </h2>
          <button
            onClick={handleClosePopup}
            className="absolute top-0 right-5 text-white text-4xl p-5"
          >
            &times;
          </button>
        </div>
        <div className="flex justify-center py-8">
          <Image
            src={selectedImage || "/images/fallback.jpg"}
            alt="Selected"
            width={200}
            height={200}
            layout="responsive"
            className="rounded mb-4"
          />
        </div>
        <div className="flex justify-center items-center space-x-4 py-5">
          <button
            className="bg-white hover:bg-black hover:text-white text-black px-2 py-2 rounded flex items-center transition-all"
            onClick={() => handleDownload(selectedImage)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v12m8-8l-8 8-8-8"
              />
            </svg>
            Download
          </button>
        </div>
        <p className="text-xs text-center py-5 w-full">
          Note: If you prefer this capture not to be public or have any
          issues.
          <br />
          Please{" "}
          <a
            className="text-blue-500 cursor-pointer"
            onClick={() => {
              handleClosePopup();
              openRemovalPopup(selectedImage);
            }}
          >
            click here to Request Removal
          </a>
          .
          <br />
          We’ll verify your request and work on it soon.
        </p>
      </div>
    </div>
  );
};

export default CapturePopup;
