import { useState } from 'react';
import { Tag } from 'lucide-react';
import Button from '../common/Button';
import BargainModal from '../common/BargainModal';

interface MakeOfferButtonProps {
    productId: string;
    productName: string;
    originalPrice: number;
    sellerId: string;
    image: string;
    onOfferSuccess?: () => void;
}

export default function MakeOfferButton({
    productId,
    productName,
    originalPrice,
    sellerId,
    image,
    onOfferSuccess
}: MakeOfferButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                className="w-full flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                icon={Tag}
                onClick={() => setIsModalOpen(true)}
            >
                Make an Offer
            </Button>

            <BargainModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    if (onOfferSuccess) onOfferSuccess();
                }}
                productLine={{
                    productId,
                    productName,
                    originalPrice,
                    sellerId,
                    image
                }}
            />
        </>
    );
}
