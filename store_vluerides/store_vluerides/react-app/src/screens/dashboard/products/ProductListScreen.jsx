import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import IcecreamOutlinedIcon from '@mui/icons-material/IcecreamOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Product } from '../../../models/product';
import { auth } from '../../../firebase';
import { ProductService } from '../../../services/productService';
import { StoreService } from '../../../services/storeService';

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'priceLowHigh', label: 'Price: Low to High' },
  { value: 'priceHighLow', label: 'Price: High to Low' },
  { value: 'nameAZ', label: 'Name: A-Z' },
];

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

function categoryIcon(category) {
  const c = category.toLowerCase();
  if (c.includes('drink')) return LocalCafeOutlinedIcon;
  if (c.includes('meal')) return RestaurantOutlinedIcon;
  if (c.includes('dessert')) return IcecreamOutlinedIcon;
  if (c.includes('combo')) return FastfoodOutlinedIcon;
  return SellOutlinedIcon;
}

function applyFilters(products, selectedCategory, query, sort) {
  let result = selectedCategory == null ? products : products.filter((p) => p.category === selectedCategory);
  if (query !== '') {
    const q = query.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q));
  }
  result = [...result];
  switch (sort) {
    case 'newest':
      result.sort((a, b) => (b.createdAt ?? new Date(0)) - (a.createdAt ?? new Date(0)));
      break;
    case 'oldest':
      result.sort((a, b) => (a.createdAt ?? new Date(0)) - (b.createdAt ?? new Date(0)));
      break;
    case 'priceLowHigh':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'priceHighLow':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'nameAZ':
      result.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      break;
    default:
      break;
  }
  return result;
}

function ListHeader({ wide, onAddProduct, selectedCategory }) {
  const title = (
    <Box>
      <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.01em' }}>
        My Products
      </Typography>
      <Box height={4} />
      <Typography variant="body2" color="text.secondary">
        Manage what riders and customers can order from your store.
      </Typography>
    </Box>
  );
  const button = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={onAddProduct} fullWidth={!wide}>
      {selectedCategory == null ? 'Add New Product' : `Add ${selectedCategory} Product`}
    </Button>
  );
  if (wide) {
    return (
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
        {title}
        {button}
      </Box>
    );
  }
  return (
    <Box>
      {title}
      <Box height={16} />
      {button}
    </Box>
  );
}

function StatCard({ icon: Icon, color, label, value, sublabel }) {
  return (
    <Box
      p={2.25}
      borderRadius={3}
      border="1px solid"
      borderColor="divider"
      bgcolor="background.paper"
      display="flex"
      alignItems="center"
      gap={1.75}
      flex={1}
      minWidth={0}
      sx={{
        transition: 'border-color 0.2s ease',
        '&:hover': { borderColor: color },
      }}
    >
      <Box
        width={46}
        height={46}
        borderRadius={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        sx={{ bgcolor: `${color}1A` }}
      >
        <Icon sx={{ color, fontSize: 22 }} />
      </Box>
      <Box minWidth={0}>
        <Typography fontSize={12.5} color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography fontSize={22} fontWeight={800} color="text.primary" sx={{ lineHeight: 1.25 }}>
          {value}
        </Typography>
        <Typography fontSize={11} color="text.disabled" noWrap>
          {sublabel}
        </Typography>
      </Box>
    </Box>
  );
}

function StatRow({ totalProducts, activeProducts, totalCategories, unavailableProducts }) {
  const stats = [
    { icon: ShoppingBagOutlinedIcon, color: '#3E7BFA', label: 'Total Products', value: totalProducts, sublabel: 'Active items in your store' },
    { icon: CheckCircleOutlineIcon, color: '#22A55A', label: 'Active Products', value: activeProducts, sublabel: 'Currently visible to customers' },
    { icon: SellOutlinedIcon, color: '#F59E0B', label: 'Categories', value: totalCategories, sublabel: 'Product categories' },
    { icon: VisibilityOffOutlinedIcon, color: '#9B59F6', label: 'Unavailable', value: unavailableProducts, sublabel: 'Hidden from customers' },
  ];
  return (
    <Box display="flex" flexWrap="wrap" gap={1.75}>
      {stats.map((s) => (
        <Box key={s.label} flex="1 1 200px" minWidth={200}>
          <StatCard {...s} />
        </Box>
      ))}
    </Box>
  );
}

function FilterRow({ wide, categories, selected, onSelected, query, onQueryChange, sort, onSortChange }) {
  const chips = (
    <Box display="flex" gap={1} overflow="auto" py={0.5}>
      <Chip
        icon={<GridViewRoundedIcon sx={{ fontSize: 16 }} />}
        label="All"
        color={selected == null ? 'primary' : 'default'}
        variant={selected == null ? 'filled' : 'outlined'}
        onClick={() => onSelected(null)}
      />
      {categories.map((c) => {
        const Icon = categoryIcon(c);
        return (
          <Chip
            key={c}
            icon={<Icon sx={{ fontSize: 16 }} />}
            label={c}
            color={selected === c ? 'primary' : 'default'}
            variant={selected === c ? 'filled' : 'outlined'}
            onClick={() => onSelected(c)}
          />
        );
      })}
    </Box>
  );
  const search = (
    <TextField
      size="small"
      placeholder="Search products..."
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
      sx={{ width: wide ? 240 : '100%' }}
    />
  );
  const sortDropdown = (
    <TextField select size="small" value={sort} onChange={(e) => onSortChange(e.target.value)} sx={{ minWidth: wide ? 200 : '100%' }}>
      {SORT_OPTIONS.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {`Sort by: ${o.label}`}
        </MenuItem>
      ))}
    </TextField>
  );

  if (wide) {
    return (
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box flex={1} minWidth={0}>
          {chips}
        </Box>
        {search}
        {sortDropdown}
      </Box>
    );
  }
  return (
    <Box display="flex" flexDirection="column" gap={1.25}>
      {chips}
      {search}
      {sortDropdown}
    </Box>
  );
}

function EmptyState({ onAddProduct }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      py={7}
      borderRadius={3}
      border="1px dashed"
      borderColor="divider"
      bgcolor="background.paper"
    >
      <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.50' }}>
        <StorefrontOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
      </Avatar>
      <Box height={20} />
      <Typography variant="h6" fontWeight={800} color="text.primary">
        No products yet
      </Typography>
      <Box height={8} />
      <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
        {'Add your first product so customers and riders can start\nordering from your store.'}
      </Typography>
      <Box height={24} />
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddProduct}>
        Add Product
      </Button>
    </Box>
  );
}

function NoMatchesState() {
  return (
    <Box textAlign="center" py={6}>
      <Typography color="text.secondary">No products match your filters.</Typography>
    </Box>
  );
}

function ActionButton({ icon: Icon, color, tooltip, onClick }) {
  return (
    <Tooltip title={tooltip}>
      <IconButton size="small" onClick={onClick} sx={{ bgcolor: `${color}1F`, color, '&:hover': { bgcolor: `${color}33` } }}>
        <Icon sx={{ fontSize: 15 }} />
      </IconButton>
    </Tooltip>
  );
}

function ProductThumb({ product, size }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <FastfoodOutlinedIcon color="disabled" />
      )}
    </Box>
  );
}

function ProductTable({ items, onToggle, onEdit, onDelete, totalCount, pageStart, page, totalPages, onPrev, onNext }) {
  return (
    <Box borderRadius={3} border="1px solid" borderColor="divider" bgcolor="background.paper" overflow="hidden">
      <Box display="flex" px={2.5} py={1.5} bgcolor="background.default" borderBottom="1px solid" borderColor="divider">
        <Box flex={5}><Typography fontSize={11.5} fontWeight={700} color="text.secondary" letterSpacing={0.4} textTransform="uppercase">Product</Typography></Box>
        <Box flex={2}><Typography fontSize={11.5} fontWeight={700} color="text.secondary" letterSpacing={0.4} textTransform="uppercase">Category</Typography></Box>
        <Box flex={2}><Typography fontSize={11.5} fontWeight={700} color="text.secondary" letterSpacing={0.4} textTransform="uppercase">Price</Typography></Box>
        <Box flex={2}><Typography fontSize={11.5} fontWeight={700} color="text.secondary" letterSpacing={0.4} textTransform="uppercase">Status</Typography></Box>
        <Box flex={2}><Typography fontSize={11.5} fontWeight={700} color="text.secondary" letterSpacing={0.4} textTransform="uppercase">Actions</Typography></Box>
      </Box>
      {items.map((product, i) => {
        const Icon = categoryIcon(product.category);
        return (
          <Box
            key={product.id}
            display="flex"
            alignItems="center"
            px={2.5}
            py={1.5}
            borderTop={i > 0 ? '1px solid' : 'none'}
            borderColor="divider"
            sx={{ transition: 'background-color 0.15s ease', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <Box flex={5} display="flex" alignItems="center" gap={1.5} minWidth={0}>
              <ProductThumb product={product} size={48} />
              <Box minWidth={0}>
                <Typography fontWeight={700} fontSize={14} noWrap>{product.name}</Typography>
                {product.description && <Typography fontSize={12} color="text.secondary" noWrap>{product.description}</Typography>}
              </Box>
            </Box>
            <Box flex={2}>
              <Chip size="small" icon={<Icon sx={{ fontSize: 13 }} />} label={product.category} color="primary" variant="outlined" />
            </Box>
            <Box flex={2}>
              <Typography fontWeight={700} fontSize={13.5}>{currency.format(product.price)}</Typography>
              {product.bulkPrice != null && (
                <Typography fontSize={11} color="text.secondary">
                  {`${currency.format(product.bulkPrice)} /pack${product.packSize != null ? ` (${product.packSize} pcs)` : ''}`}
                </Typography>
              )}
            </Box>
            <Box flex={2} display="flex" alignItems="center" gap={0.5}>
              <Switch size="small" checked={product.available} onChange={(e) => onToggle(product, e.target.checked)} />
              <Typography fontSize={11} fontWeight={600} color={product.available ? '#22A55A' : 'text.disabled'}>
                {product.available ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
            <Box flex={2} display="flex" gap={0.75}>
              <ActionButton icon={EditOutlinedIcon} color="#1565C0" tooltip="Edit" onClick={() => onEdit(product)} />
              <ActionButton icon={DeleteOutlineIcon} color="#BA1A1A" tooltip="Delete" onClick={() => onDelete(product)} />
            </Box>
          </Box>
        );
      })}
      <Box display="flex" alignItems="center" px={2.5} py={1.75} borderTop="1px solid" borderColor="divider" bgcolor="background.default">
        <Typography fontSize={12.5} color="text.secondary">
          {`Showing ${totalCount === 0 ? 0 : pageStart + 1} to ${Math.min(pageStart + items.length, totalCount)} of ${totalCount} products`}
        </Typography>
        <Box flex={1} />
        <IconButton size="small" disabled={!onPrev} onClick={onPrev}><ChevronLeftIcon /></IconButton>
        <Box width={28} height={28} display="flex" alignItems="center" justifyContent="center" borderRadius="50%" bgcolor="primary.main">
          <Typography color="#fff" fontWeight={700} fontSize={12.5}>{page + 1}</Typography>
        </Box>
        <IconButton size="small" disabled={!onNext} onClick={onNext}><ChevronRightIcon /></IconButton>
      </Box>
    </Box>
  );
}

function ProductCard({ product, onToggle, onEdit, onDelete }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1.75}
      p={1.5}
      borderRadius={3}
      border="1px solid"
      borderColor="divider"
      bgcolor="background.paper"
    >
      <ProductThumb product={product} size={64} />
      <Box flex={1} minWidth={0}>
        <Typography fontWeight={700} fontSize={15} noWrap>{product.name}</Typography>
        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
          <Chip size="small" label={product.category} />
          <Typography fontWeight={700} color="primary" fontSize={13.5}>{currency.format(product.price)}</Typography>
        </Box>
      </Box>
      <Switch checked={product.available} onChange={(e) => onToggle(e.target.checked)} />
      <IconButton onClick={onEdit}><EditOutlinedIcon /></IconButton>
      <IconButton onClick={onDelete}><DeleteOutlineIcon /></IconButton>
    </Box>
  );
}

function useProductListData() {
  const uid = auth.currentUser.uid;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(null);

  useEffect(() => StoreService.streamProductCategories(uid, setCategories), [uid]);
  useEffect(() => ProductService.streamProducts(uid, {}, setProducts), [uid]);

  return { uid, categories, products };
}

export default function ProductListScreen() {
  const navigate = useNavigate();
  const wide = useMediaQuery('(min-width:860px)');
  const { uid, categories, products } = useProductListData();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const selected = categories.includes(selectedCategory) ? selectedCategory : null;
  const filtered = useMemo(
    () => applyFilters(products ?? [], selected, query, sort),
    [products, selected, query, sort]
  );

  const totalPages = filtered.length === 0 ? 1 : Math.ceil(filtered.length / PAGE_SIZE);
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageStart = clampedPage * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const confirmDelete = async () => {
    if (pendingDelete) await ProductService.deleteProduct(uid, pendingDelete.id);
    setPendingDelete(null);
  };

  if (products === null) {
    return (
      <Box display="flex" justifyContent="center" pt={10}>
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box px={3} pt={3} pb={wide ? 4 : 12}>
      <ListHeader wide={wide} onAddProduct={() => navigate('/products/new', { state: selectedCategory })} selectedCategory={selectedCategory} />
      <Box height={20} />
      <StatRow
        totalProducts={products.length}
        activeProducts={products.filter((p) => p.available).length}
        totalCategories={categories.length}
        unavailableProducts={products.filter((p) => !p.available).length}
      />
      {products.length > 0 && (
        <>
          <Box height={16} />
          <FilterRow
            wide={wide}
            categories={categories}
            selected={selected}
            onSelected={(c) => {
              setSelectedCategory(c);
              setPage(0);
            }}
            query={query}
            onQueryChange={(v) => {
              setQuery(v);
              setPage(0);
            }}
            sort={sort}
            onSortChange={setSort}
          />
        </>
      )}
      <Box height={20} />
      {filtered.length === 0 ? (
        products.length === 0 ? (
          <EmptyState onAddProduct={() => navigate('/products/new')} />
        ) : (
          <NoMatchesState />
        )
      ) : wide ? (
        <ProductTable
          items={pageItems}
          onToggle={(p, v) => ProductService.toggleAvailability(uid, p.id, v)}
          onEdit={(p) => navigate(`/products/${p.id}/edit`)}
          onDelete={(p) => setPendingDelete(p)}
          totalCount={filtered.length}
          pageStart={pageStart}
          page={clampedPage}
          totalPages={totalPages}
          onPrev={clampedPage > 0 ? () => setPage(clampedPage - 1) : null}
          onNext={clampedPage < totalPages - 1 ? () => setPage(clampedPage + 1) : null}
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggle={(v) => ProductService.toggleAvailability(uid, product.id, v)}
              onEdit={() => navigate(`/products/${product.id}/edit`)}
              onDelete={() => setPendingDelete(product)}
            />
          ))}
        </Box>
      )}

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>This will permanently remove "{pendingDelete?.name}".</DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// TEMP DEV PREVIEW — remove before shipping.
const FAKE_PRODUCTS = [
  new Product({ id: '1', name: 'Chicken joy with rice', description: 'Delicious chicken joy served with steamed rice.', price: 12, category: 'Meal', available: true }),
  new Product({ id: '2', name: 'Coke Float', description: 'Refreshing coke float perfect for any day.', price: 50, category: 'Drinks', available: true }),
  new Product({ id: '3', name: 'Orashare', description: 'Special refreshment from Orashare.', price: 20, category: 'Drinks', available: true }),
];
const FAKE_CATEGORIES = ['Drinks', 'Meal', 'Dessert', 'Combo'];

export function DevPreviewProductList() {
  const wide = useMediaQuery('(min-width:860px)');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const selected = FAKE_CATEGORIES.includes(selectedCategory) ? selectedCategory : null;
  const filtered = selected == null ? FAKE_PRODUCTS : FAKE_PRODUCTS.filter((p) => p.category === selected);

  return (
    <Box px={3} pt={3} pb={4}>
      <ListHeader wide={wide} onAddProduct={() => {}} selectedCategory={selectedCategory} />
      <Box height={20} />
      <StatRow
        totalProducts={FAKE_PRODUCTS.length}
        activeProducts={FAKE_PRODUCTS.filter((p) => p.available).length}
        totalCategories={FAKE_CATEGORIES.length}
        unavailableProducts={FAKE_PRODUCTS.filter((p) => !p.available).length}
      />
      <Box height={16} />
      <FilterRow
        wide={wide}
        categories={FAKE_CATEGORIES}
        selected={selected}
        onSelected={setSelectedCategory}
        query=""
        onQueryChange={() => {}}
        sort="newest"
        onSortChange={() => {}}
      />
      <Box height={16} />
      <ProductTable
        items={filtered}
        onToggle={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        totalCount={filtered.length}
        pageStart={0}
        page={0}
        totalPages={1}
        onPrev={null}
        onNext={null}
      />
    </Box>
  );
}
