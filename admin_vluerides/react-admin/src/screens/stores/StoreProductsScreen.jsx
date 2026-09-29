import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Grid, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import { AppColors } from '../../theme/colors';
import { useStores } from '../../context/StoreContext';
import * as firestoreService from '../../services/firestoreService';
import { formatCurrency } from '../../utils/appUtils';
import { EmptyState } from '../../components/EmptyState';

// Mirrors lib/screens/stores/store_products_screen.dart — read-only, since
// products are managed by the store owner's own app.
export default function StoreProductsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = useStores();
  const store = provider.allStores.find((s) => s.id === id);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = firestoreService.streamStoreProducts(id, setProducts, (e) => setError(e?.message ?? String(e)));
    return unsubscribe;
  }, [id]);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {store ? `${store.name} — Menu` : 'Menu'}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {error ? (
          <Typography sx={{ color: AppColors.error, textAlign: 'center', mt: 4 }}>Failed to load menu: {error}</Typography>
        ) : products === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
            <CircularProgress sx={{ color: AppColors.primary }} />
          </Box>
        ) : products.length === 0 ? (
          <EmptyState icon={RestaurantMenuOutlinedIcon} title="No Products Yet" subtitle="This store hasn't added any menu items" />
        ) : (
          <Grid container spacing={1.5} sx={{ maxWidth: 960, mx: 'auto' }}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

function ProductCard({ product }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, display: 'flex', gap: 1.5 }}>
      <Box
        sx={{
          width: 84,
          height: 84,
          borderRadius: '10px',
          bgcolor: AppColors.background,
          flexShrink: 0,
          backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!product.imageUrl && <FastfoodOutlinedIcon sx={{ color: AppColors.textSecondary }} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</Typography>
          <Box sx={{ px: 1, py: 0.35, borderRadius: '6px', bgcolor: product.available ? AppColors.successLight : AppColors.errorLight, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: product.available ? AppColors.success : AppColors.error }}>
              {product.available ? 'Available' : 'Out of Stock'}
            </Typography>
          </Box>
        </Box>
        {product.category && <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, mt: 0.25 }}>{product.category}</Typography>}
        {product.description && (
          <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary, mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </Typography>
        )}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: AppColors.primary, mt: 0.5 }}>{formatCurrency(product.price)}</Typography>
      </Box>
    </Box>
  );
}
