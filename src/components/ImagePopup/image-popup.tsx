import { Share2, Info } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";

import UseRefetch from "~/hooks/use-refetch";
import { api } from "~/utils/api";
import { Button } from 'react-bootstrap';
import { Avatar, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useSession } from "next-auth/react";
import { MoreInfo } from "../MoreInfoDrawer/more-infoPopup";
import { Badge } from "../ui/badge";

interface ImagePopupProps {
    selectedImage: string | null;
    selectedImageOg: string | null;
    selectedImageId: number | null;
    handleClosePopup: () => void;
    handleDownload: (imageUrl: string) => void;
    openRemovalPopup: (imageUrl: string) => void;
    session_user: string;
    session_role: string;
    sessionId: string;
}

const ImagePopup: React.FC<ImagePopupProps> = ({
    selectedImage,
    selectedImageOg,
    selectedImageId,
    handleClosePopup,
    handleDownload,
    openRemovalPopup,
    session_user,
    session_role,
    sessionId,
}) => {
    const refetch = UseRefetch();
    const [isLandscape, setIsLandscape] = useState(true);
    const [isLoadings, setIsLoading] = useState(true);
    const [openMoreInfo, setOpenMoreInfor] = useState(false);
    const { data: session } = useSession();
    const { data: totalLikes, isLoading } = api.like.getTotalLikes.useQuery({ captureId: selectedImageId! });
    const { data: hasLiked } = api.like.hasLiked.useQuery({ captureId: selectedImageId! });
    const { data: acthor } = api.capture.getAuthorDetails.useQuery({ id: selectedImageId! });
    const toggleLike = api.like.toggleLike.useMutation();

    const handleToggleLike = async () => {
        if (selectedImageId && hasLiked !== null) {
            try {
                await toggleLike.mutateAsync({
                    galleryId: selectedImageId,
                    toggle: !hasLiked,
                });
                refetch();
            } catch (error) {
                console.error("Error toggling like:", error);
            }
        }
    };

    const handleShare = async () => {
        if (navigator.share && selectedImage) {
            try {
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                const file = new File([blob], "shared-image.webp", { type: blob.type });

                await navigator.share({
                    files: [file],
                });
                console.log("Image shared successfully");
            } catch (error) {
                console.error("Error sharing image:", error);
            }
        } else {
            alert("Sharing files is not supported on your device.");
        }
    };

    if (!selectedImage) return null;


    const handleImageLoad = (event: any) => {
        const { naturalWidth, naturalHeight } = event.target;
        setIsLandscape(naturalWidth > naturalHeight);
        setIsLoading(false);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col  items-center justify-center z-50"
                role="dialog"
                aria-modal="true"
                onClick={handleClosePopup}
            >

                <div
                    className="   md:w-auto max-h-[98vh]  w-full h-fit space-y-10 bg-gradient-to-tl from-neutral-950/90 via-neutral-800 to-neutral-950/90 grid grid-cols-1 gap-4 rounded-3xl  p-4 md:p-5 border-[4px] border-gray-600"
                    onClick={(e) => e.stopPropagation()}
                >

                    <div className="relative w-full mb-4">
                        <div className="absolute right-0 flex items-end shadow-2xl border border-gray-800 rounded-full w-fit bg-white px-0  space-x-3">

                            <div className="w-[50px] relative z-50 h-[52px] border border-gray-500 rounded-full flex items-center justify-center overflow-hidden">
                                <Avatar className="w-full h-full">
                                    <AvatarImage src={acthor?.image || "https://github.com/shadcn.png"} alt={acthor?.name || "User"} />
                                </Avatar>
                            </div>


                            <div className="ml-2 flex flex-col text-left px-3 py-2">
                                <span className="text-[10px] font-bold text-black">Captured By</span>
                                <span className="text-[10px] font-semibold text-black">{acthor?.name || "Username"}</span>
                            </div>
                        </div>
                    </div>



                    <div className="flex items-center justify-center">
                        {isLoadings && (
                            <Skeleton
                                className={`rounded-lg border-[3px] border-gray-700 shadow-2xl ${isLandscape ? "w-[500px] h-[350px]" : "w-[300px] h-[400px]"
                                    }`}
                            />
                        )}

                        <Image
                            src={selectedImage || "/images/fallback.webp"}
                            alt="Selected"
                            className={`rounded-lg border-[3px] border-gray-700 shadow-2xl transition-opacity ${isLoading ? "opacity-0" : "opacity-100"
                                }`}
                            width={isLandscape ? 500 : 300}
                            height={isLandscape ? 350 : 400}
                            layout="intrinsic"
                            onLoad={handleImageLoad}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-xs sm:text-sm mx-auto max-w-lg  text-white">
                            Note: If you prefer this capture not to be public or have any issues. We’ll verify your request and work on it soon.Press on Request Removal
                        </p>

                    </div>


                    <div className="flex justify-center gap-2  items-center">
                        <button onClick={handleToggleLike} aria-label="Like Button">
                            <FaHeart size={24} color={hasLiked ? "red" : "white"} />
                        </button>

                        <span className="flex items-center text-white text-sm">
                            {isLoading ? "..." : totalLikes !== null ? totalLikes : "..."}
                        </span>

                        <Button onClick={handleShare} className="flex items-center">
                            <Share2 className="text-white w-5 h-5" />
                        </Button>

                        <Button
                            className="bg-white rounded-xl text-black p-3 text-sm hover:scale-105 transition-all"
                            onClick={() => handleDownload(selectedImageOg || selectedImage)}
                        >
                            Download
                        </Button>
                        <Button
                            className="bg-white rounded-xl  text-bold text-black p-3 text-sm hover:scale-105 transition-all"
                            onClick={() => {
                                handleClosePopup();
                                openRemovalPopup(selectedImage);
                            }}
                        >
                            Request Removal
                        </Button>
                        <button
                            onClick={() => setOpenMoreInfor(true)}
                        >
                            <Info className="text-white" />
                        </button>

                    </div>

                </div>
            </div>
            {
                openMoreInfo && (
                    <MoreInfo
                        isOpen={openMoreInfo}
                        setOpen={setOpenMoreInfor}
                        id={selectedImageId!}
                        apiTobeCalled="capture"
                    />
                )
            }

        </>
    );
};

export default ImagePopup;
