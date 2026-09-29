import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { auth } from '../../../firebase';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/productService';
import { StorageService } from '../../../services/storageService';
import { StoreService } from '../../../services/storeService';
import { Validators } from '../../../utils/validators';
import FormSectionHeader from '../../../widgets/common/FormSectionHeader';
import ImageUploadField from '../../../widgets/imageUpload/ImageUploadField';

function MessageBanner({ text, color, background, icon: Icon }) {
  return (
    <Box p={1.5} borderRadius={1.5} display="flex" alignItems="flex-start" sx={{ bgcolor: background }}>
      <Icon fontSize="small" sx={{ color, mr: 1.25 }} />
      <Typography variant="body2" sx={{ color }}>
        {text}
      </Typography>
    </Box>
  );
}

function LockedCategoryBanner({ category }) {
  return (
    <Box px={1.75} py={1.5} borderRadius={1.5} display="flex" alignItems="center" sx={{ bgcolor: 'primary.50' }}>
      <CategoryOutlinedIcon fontSize="small" color="primary" sx={{ mr: 1.25 }} />
      <Typography variant="body2">
        Category: <b>{category}</b>
      </Typography>
    </Box>
  );
}

function NoCategoriesNotice({ onManageCategories }) {
  return (
    <Box p={1.75} borderRadius={1.5} sx={{ bgcolor: 'error.light' }}>
      <Box display="flex" alignItems="flex-start">
        <CategoryOutlinedIcon fontSize="small" sx={{ color: 'error.main', mr: 1.25 }} />
        <Typography variant="body2" color="error.main">
          You haven't added any product categories yet. Add at least one before you can save a product.
        </Typography>
      </Box>
      <Box height={10} />
      <Button variant="outlined" startIcon={<AddIcon />} onClick={onManageCategories}>
        Add a category
      </Button>
    </Box>
  );
}

export default function ProductFormScreen() {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const location = useLocation();
  const initialCategoryFromNav = productId == null ? location.state ?? null : null;
  const isEditing = productId != null;
  const categoryLocked = !isEditing && initialCategoryFromNav != null;

  const uid = auth.currentUser.uid;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [packSize, setPackSize] = useState('');
  const [category, setCategory] = useState(categoryLocked ? initialCategoryFromNav : null);
  const [categories, setCategories] = useState([]);
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imageContentType, setImageContentType] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const store = await StoreService.getStore(uid);
      const product = isEditing ? await ProductService.getProduct(uid, productId) : null;
      if (cancelled) return;

      let cats = store?.productCategories ?? [];
      let cat = categoryLocked ? initialCategoryFromNav : null;
      if (product != null) {
        setName(product.name);
        setDescription(product.description ?? '');
        setPrice(String(product.price));
        setBulkPrice(product.bulkPrice != null ? String(product.bulkPrice) : '');
        setPackSize(product.packSize != null ? String(product.packSize) : '');
        cat = product.category;
        setAvailable(product.available);
        setExistingImageUrl(product.imageUrl);
      }
      // The product's saved category may have been removed from the
      // managed list since — keep it selectable so editing doesn't crash
      // the dropdown or silently wipe out the existing value.
      if (cat != null && !cats.includes(cat)) cats = [cat, ...cats];
      setCategory(cat);
      setCategories(cats);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const submit = async (e) => {
    e.preventDefault();
    const errors = {
      name: Validators.required(name, 'Product name'),
      price: Validators.price(price),
      bulkPrice: Validators.optionalPrice(bulkPrice),
      packSize: Validators.optionalPositiveInt(packSize),
      category: category == null ? 'Select a category' : null,
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    setError(null);
    try {
      const id = productId ?? ProductService.newProductId(uid);
      const bulkPriceValue = bulkPrice.trim() === '' ? null : Number.parseFloat(bulkPrice.trim());
      const packSizeValue = packSize.trim() === '' ? null : Number.parseInt(packSize.trim(), 10);

      let imageUrl = existingImageUrl;
      if (imageFile != null) {
        imageUrl = await StorageService.uploadProductPhoto({ storeId: uid, productId: id, bytes: imageFile, contentType: imageContentType });
      }

      if (isEditing) {
        await ProductService.updateProduct(uid, id, {
          name: name.trim(),
          description: description.trim() === '' ? null : description.trim(),
          price: Number.parseFloat(price.trim()),
          bulkPrice: bulkPriceValue,
          packSize: packSizeValue,
          category,
          available,
          imageUrl,
        });
      } else {
        await ProductService.addProduct(
          uid,
          id,
          new Product({
            id,
            name: name.trim(),
            description: description.trim() === '' ? null : description.trim(),
            price: Number.parseFloat(price.trim()),
            bulkPrice: bulkPriceValue,
            packSize: packSizeValue,
            category,
            imageUrl,
            available,
          })
        );
      }
      navigate('/');
    } catch (e) {
      setError(`Something went wrong: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" pt={10}>
        <CircularProgress />
      </Box>
    );
  }

  const title = isEditing ? 'Edit Product' : 'Add New Product';
  const subtitle = isEditing
    ? 'Update the details customers and riders see for this product.'
    : categoryLocked
      ? `Adding to the "${initialCategoryFromNav}" category.`
      : 'Add a new item for riders and customers to order.';

  return (
    <Box display="flex" justifyContent="center" px={3} pt={3.5} pb={3}>
      <Box maxWidth={640} width="100%">
        <Box display="flex" alignItems="flex-start" gap={1.75}>
          <IconButton onClick={() => navigate('/')} sx={{ bgcolor: 'action.hover' }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800}>{title}</Typography>
            <Box height={4} />
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          </Box>
        </Box>
        <Box height={20} />
        <Box p={3} borderRadius={2} border="1px solid" borderColor="divider" bgcolor="background.paper" component="form" onSubmit={submit} display="flex" flexDirection="column" gap={2}>
          <FormSectionHeader icon={InfoOutlinedIcon} title="Product Details" />
          <TextField fullWidth label="Product Name" value={name} onChange={(e) => setName(e.target.value)} error={Boolean(fieldErrors.name)} helperText={fieldErrors.name ?? ' '} />
          <TextField fullWidth multiline minRows={3} label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextField
            fullWidth
            label="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={Boolean(fieldErrors.price)}
            helperText={fieldErrors.price ?? ' '}
            InputProps={{ startAdornment: '₱ ' }}
          />
          <TextField
            fullWidth
            label="Price per Pack (optional)"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            error={Boolean(fieldErrors.bulkPrice)}
            helperText={fieldErrors.bulkPrice ?? ' '}
            InputProps={{ startAdornment: '₱ ' }}
          />
          <TextField
            fullWidth
            label="Pieces per Pack (optional)"
            value={packSize}
            onChange={(e) => setPackSize(e.target.value)}
            error={Boolean(fieldErrors.packSize)}
            helperText={fieldErrors.packSize ?? ' '}
          />
          {categoryLocked ? (
            <LockedCategoryBanner category={category} />
          ) : categories.length === 0 ? (
            <NoCategoriesNotice onManageCategories={() => navigate('/categories')} />
          ) : (
            <TextField
              select
              fullWidth
              label="Category"
              value={category ?? ''}
              onChange={(e) => setCategory(e.target.value)}
              error={Boolean(fieldErrors.category)}
              helperText={fieldErrors.category ?? ' '}
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          )}

          <Divider sx={{ my: 1 }} />
          <FormSectionHeader icon={VisibilityOutlinedIcon} title="Availability" />
          <FormControlLabel
            control={<Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} />}
            label={
              <Box>
                <Typography>Available</Typography>
                <Typography variant="caption" color="text.secondary">Shown to customers when on</Typography>
              </Box>
            }
          />

          <Divider sx={{ my: 1 }} />
          <FormSectionHeader icon={ImageOutlinedIcon} title="Product Photo" />
          <ImageUploadField
            label="Product Photo"
            initialImageUrl={existingImageUrl}
            onImageSelected={(file, contentType) => {
              setImageFile(file);
              setImageContentType(contentType);
            }}
          />

          {error && <MessageBanner text={error} color="error.main" background="error.light" icon={ErrorOutlineIcon} />}

          <Button type="submit" variant="contained" disabled={submitting || (!categoryLocked && categories.length === 0)} sx={{ mt: 1 }}>
            {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : isEditing ? 'Save Changes' : 'Add Product'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
