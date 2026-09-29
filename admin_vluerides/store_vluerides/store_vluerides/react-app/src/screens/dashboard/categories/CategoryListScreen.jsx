import AddIcon from '@mui/icons-material/Add';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import IcecreamOutlinedIcon from '@mui/icons-material/IcecreamOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { auth } from '../../../firebase';
import { StoreService } from '../../../services/storeService';

function categoryIcon(category) {
  const c = category.toLowerCase();
  if (c.includes('drink')) return LocalCafeOutlinedIcon;
  if (c.includes('meal')) return RestaurantOutlinedIcon;
  if (c.includes('dessert')) return IcecreamOutlinedIcon;
  if (c.includes('combo')) return FastfoodOutlinedIcon;
  return SellOutlinedIcon;
}

function EmptyCategoriesCard() {
  return (
    <Box p={4} borderRadius={2} border="1px solid" borderColor="divider" bgcolor="background.paper" display="flex" flexDirection="column" alignItems="center">
      <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.50' }}>
        <CategoryOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
      </Avatar>
      <Box height={16} />
      <Typography fontWeight={700} fontSize={15}>No categories yet</Typography>
      <Box height={6} />
      <Typography color="text.secondary">Add your first one above.</Typography>
    </Box>
  );
}

export default function CategoryListScreen() {
  const uid = auth.currentUser.uid;
  const [categories, setCategories] = useState(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);

  useEffect(() => StoreService.streamProductCategories(uid, setCategories), [uid]);

  const add = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') {
      setError('Enter a category name');
      return;
    }
    const existing = categories ?? [];
    if (existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('That category already exists');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await StoreService.addProductCategory(uid, trimmed);
      setName('');
    } catch (e) {
      setError(`Something went wrong: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemove = async () => {
    if (pendingRemove) await StoreService.removeProductCategory(uid, pendingRemove);
    setPendingRemove(null);
  };

  const list = categories ?? [];

  return (
    <Box display="flex" justifyContent="center" px={3} pt={3.5} pb={3}>
      <Box maxWidth={720} width="100%">
        <Typography variant="h5" fontWeight={800}>Product Categories</Typography>
        <Box height={4} />
        <Typography variant="body2" color="text.secondary">
          Add categories to organize your products (e.g. Main Dish, Drinks, Snacks). You'll pick from this list when
          adding a product.
        </Typography>
        <Box height={20} />
        <Box p={2.5} borderRadius={2} border="1px solid" borderColor="divider" bgcolor="background.paper" component="form" onSubmit={add}>
          <Box display="flex" gap={1.5} alignItems="flex-start">
            <TextField fullWidth label="New category" placeholder="e.g. Main Dish" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AddIcon />}>
              Add
            </Button>
          </Box>
        </Box>
        {error && (
          <Box mt={1.5} p={1.5} borderRadius={1.5} display="flex" alignItems="flex-start" sx={{ bgcolor: 'error.light' }}>
            <ErrorOutlineIcon fontSize="small" sx={{ color: 'error.main', mr: 1.25 }} />
            <Typography variant="body2" color="error.main">{error}</Typography>
          </Box>
        )}
        <Box height={24} />
        {categories === null ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : list.length === 0 ? (
          <EmptyCategoriesCard />
        ) : (
          <Box borderRadius={2} border="1px solid" borderColor="divider" bgcolor="background.paper" overflow="hidden">
            <Box px={2.5} py={1.75} bgcolor="action.hover">
              <Typography fontSize={12.5} fontWeight={700} color="text.secondary">
                {`${list.length} ${list.length === 1 ? 'category' : 'categories'}`}
              </Typography>
            </Box>
            {list.map((category, i) => {
              const Icon = categoryIcon(category);
              return (
                <Box key={category} display="flex" alignItems="center" px={2.5} py={1.25} borderTop={i > 0 ? '1px solid' : 'none'} borderColor="divider">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.50' }}>
                    <Icon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </Avatar>
                  <Typography flex={1} ml={1.75} fontWeight={700} fontSize={14}>{category}</Typography>
                  <Tooltip title="Remove">
                    <IconButton onClick={() => setPendingRemove(category)} sx={{ color: 'error.main', bgcolor: 'error.light' }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Dialog open={Boolean(pendingRemove)} onClose={() => setPendingRemove(null)}>
        <DialogTitle>Remove category?</DialogTitle>
        <DialogContent>
          Removing "{pendingRemove}" won't change existing products already using it, but it will no longer be
          offered when adding or editing products.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingRemove(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmRemove}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
