import { ConfirmButton } from '@/components/rewards/Form';
import { Badge, PageTitle, Panel, Table, TextLink } from '@/components/rewards/Shell';
import { ButtonLink } from '@/components/ui/Button';
import { deleteDesignProduct } from '@/lib/designer/actions';
import { normaliseOptions, peso, priceFor, sizeLabel } from '@/lib/designer/model';
import { listProducts } from '@/lib/designer/store';
import { requireRole } from '@/lib/rewards/auth';

export const metadata = { title: 'Designer Products' };

export default async function DesignerProductsPage() {
  await requireRole('admin');
  const products = listProducts({ activeOnly: false });
  return (
    <>
      <PageTitle
        title="Design Online products"
        sub="Products customers can configure and design at /design. Hidden products are only visible to admins."
        actions={<ButtonLink href="/rewards/admin/designer/new">Add product</ButtonLink>}
      />
      <Panel>
        <Table head={['Product', 'Sizes', 'Options', 'From', 'Status', '']} empty={products.length === 0}>
          {products.map((p) => {
            const s = p.config.sizes[0];
            const from = s ? priceFor(p.config, { ...s, qty: 1, options: normaliseOptions(p.config, {}) }) : null;
            return (
              <tr key={p.id}>
                <td>
                  <span className="font-medium">{p.name}</span>
                  <span className="block text-[12px] text-grey-muted">/design/{p.slug}</span>
                </td>
                <td className="text-[13px]">
                  {p.config.sizes.map((x) => sizeLabel(x.w, x.h, p.config.unit)).join(', ')}
                  {p.config.allowCustomSize ? ' + custom' : ''}
                </td>
                <td className="text-[13px]">{p.config.groups.map((g) => g.label).join(', ')}</td>
                <td>{from && !from.error ? peso(from.perItem) : '—'}</td>
                <td>
                  <Badge tone={p.active ? 'done' : 'neutral'}>{p.active ? 'Live' : 'Hidden'}</Badge>
                </td>
                <td className="whitespace-nowrap text-right">
                  <TextLink href={`/rewards/admin/designer/${p.id}`}>Edit</TextLink>
                  <TextLink href={`/design/${p.slug}`}>{p.active ? 'View' : 'Preview'}</TextLink>
                  <ConfirmButton action={deleteDesignProduct} fields={{ id: p.id }} confirm={`Delete ${p.name}? Existing quotes keep their details.`}>
                    Delete
                  </ConfirmButton>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </>
  );
}
