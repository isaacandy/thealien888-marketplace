
import { WithContext, Product } from 'schema-dts';
import { RaribleItem } from '../lib/utils';

export function ProductSchema({ item }: { item: RaribleItem }) {
    const { meta } = item;
    if (!meta?.name) {
        return null;
    }
    const jsonLd: WithContext<Product> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: meta.name,
        description: meta.description,
        image: meta.image?.url || meta.content?.find(c => c.representation === 'PREVIEW')?.url || meta.content?.[0]?.url,
        sku: item.id,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
