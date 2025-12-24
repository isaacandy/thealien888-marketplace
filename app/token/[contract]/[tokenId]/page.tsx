
import { fetchItemById } from '../../../../lib/RaribleService';
import { RaribleItem, resolveItemImageUrl } from '../../../../lib/utils';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductSchema } from '../../../../components/Schema';

type TokenPageProps = {
    params: {
        contract: string;
        tokenId: string;
    };
};

export default async function TokenPage({ params }: TokenPageProps) {
    const { contract, tokenId } = params;
    const itemId = `ETHEREUM:${contract}:${tokenId}`;
    let item: RaribleItem;

    try {
        item = await fetchItemById(itemId);
    } catch (error) {
        console.error(error);
        notFound();
    }

    const imageUrl = resolveItemImageUrl(item) || item.meta?.content?.[0]?.url || '';

    return (
        <>
            <ProductSchema item={item} />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        {imageUrl && (
                            <Image
                                src={imageUrl}
                                alt={item.meta?.name || 'NFT Image'}
                                width={500}
                                height={500}
                                className="rounded-lg"
                            />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{item.meta?.name || ''}</h1>
                        <p className="text-gray-400 mb-4">{item.meta?.description || ''}</p>
                        <div className="space-y-2">
                            <p><span className="font-semibold">Contract:</span> {item.contract}</p>
                            <p><span className="font-semibold">Token ID:</span> {item.tokenId}</p>
                            <p><span className="font-semibold">Blockchain:</span> {item.blockchain}</p>
                        </div>
                        {/* No bestSellOrder property on RaribleItem; display placeholder or nothing */}
                    </div>
                </div>
            </div>
        </>
    );
}
