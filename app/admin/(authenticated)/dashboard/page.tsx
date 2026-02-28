// app/admin/(authenticated)/dashboard/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG, PRODUCT_CATEGORIES } from '@/lib/config';
import { Trash2, PackagePlus, Edit2, CheckCircle, XCircle, Image as ImageIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/lib/types';

// Maximum image dimension (width or height) for client-side compression
const MAX_IMAGE_DIMENSION = 800;
const IMAGE_QUALITY = 0.8;

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('Sweets');
  const [stepInterval, setStepInterval] = useState('1');
  const [minQuantity, setMinQuantity] = useState('1');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching products:', error.message);
    else setProducts(data || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchProducts(), 0);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  // Handle Image Selection
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  // Client-side image compression using Canvas API
  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if larger than max dimension
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = Math.round((height / width) * MAX_IMAGE_DIMENSION);
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = Math.round((width / height) * MAX_IMAGE_DIMENSION);
            height = MAX_IMAGE_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          IMAGE_QUALITY
        );
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // Delete an image from Supabase Storage by its URL
  async function deleteStorageImage(imageUrl: string) {
    try {
      // Extract the file path from the full public URL
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length < 2) return;
      const filePath = urlParts[1];

      await supabase.storage.from('product-images').remove([filePath]);
    } catch (err) {
      console.error('Error deleting old image:', err);
    }
  }

  // Upload image to Supabase Storage (with compression)
  async function uploadImage(file: File): Promise<string | null> {
    // Compress image before uploading
    const compressedFile = await compressImage(file);
    const fileExt = 'jpg'; // Always save as jpeg after compression
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, compressedFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Submit Add or Edit Product
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;

    setUploading(true);

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    if (editingId) {
      // If replacing the image, delete the old one from storage
      const existingProduct = products.find(p => p.id === editingId);
      if (imageUrl && existingProduct?.image_url) {
        await deleteStorageImage(existingProduct.image_url);
      }

      // Update existing item
      const updateData: Record<string, unknown> = {
        name,
        category,
        price: parseFloat(price),
        unit,
        step_interval: parseFloat(stepInterval),
        min_quantity: parseFloat(minQuantity)
      };
      if (imageUrl) updateData.image_url = imageUrl;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', editingId);

      if (error) toast.error('Error updating product: ' + error.message);
      else toast.success('Product updated!');
    } else {
      // Insert new item
      const { error } = await supabase.from('products').insert([
        {
          name,
          category,
          price: parseFloat(price),
          unit,
          image_url: imageUrl,
          step_interval: parseFloat(stepInterval),
          min_quantity: parseFloat(minQuantity)
        },
      ]);
      if (error) toast.error('Error adding product: ' + error.message);
      else toast.success('Product added!');
    }

    setUploading(false);
    resetForm();
    fetchProducts();
  }

  function handleEditClick(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category || 'Sweets');
    setPrice(product.price.toString());
    setUnit(product.unit);
    setStepInterval(product.step_interval?.toString() || '1');
    setMinQuantity(product.min_quantity?.toString() || '1');
    setImageFile(null);
    setImagePreview(product.image_url);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setCategory('Sweets');
    setPrice('');
    setUnit('kg');
    setStepInterval('1');
    setMinQuantity('1');
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    // Also delete the image from storage
    const product = products.find(p => p.id === id);
    if (product?.image_url) {
      await deleteStorageImage(product.image_url);
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Error deleting product: ' + error.message);
    else {
      toast.success('Product deleted.');
      fetchProducts();
    }
  }

  async function toggleStockStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_out_of_stock: !currentStatus })
      .eq('id', id);

    if (error) toast.error('Error updating stock status: ' + error.message);
    else {
      toast.success(currentStatus ? 'Marked back in stock.' : 'Marked out of stock.');
      fetchProducts();
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Products Dashboard</h2>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-4">
              <div className="skeleton h-[150px] w-full"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="skeleton h-10 w-full"></div>
                <div className="skeleton h-10 w-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="skeleton h-10 w-full"></div>
                <div className="skeleton h-10 w-full"></div>
              </div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="skeleton w-16 h-16 rounded-lg"></div>
                  <div>
                    <div className="skeleton h-5 w-32 mb-2"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="skeleton w-8 h-8 rounded-md"></div>
                  <div className="skeleton w-8 h-8 rounded-md"></div>
                  <div className="skeleton w-8 h-8 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Products Dashboard</h2>
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-shadow"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* Add/Edit Product Form — NOT sticky on mobile to prevent overlap */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 md:sticky md:top-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold flex items-center gap-2 text-gray-800">
              {editingId ? <Edit2 size={20} /> : <PackagePlus size={20} />}
              {editingId ? 'Edit Sweet' : 'Add New Sweet'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-red-500 hover:underline active:underline cursor-pointer select-none p-1">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 flex flex-col items-center justify-center relative overflow-hidden select-none"
                style={{ height: '150px' }}
                onClick={() => fileInputRef.current?.click()}
                onTouchEnd={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="h-full object-cover" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">Auto-compressed to save space</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="e.g., Kaju Katli" required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                >
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ({SHOP_CONFIG.currency})
                </label>
                <input
                  id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="400" required
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="piece">Piece</option>
                  <option value="dozen">Dozen</option>
                  <option value="box">Box</option>
                  <option value="250g">250g</option>
                  <option value="500g">500g</option>
                </select>
              </div>
            </div>

            {/* Step Interval and Min Quantity */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
              <div>
                <label htmlFor="stepInterval" className="block text-sm font-medium text-gray-700 mb-1 text-red-800">
                  Step Interval
                </label>
                <input
                  id="stepInterval" type="number" step="0.01" min="0.01" value={stepInterval} onChange={(e) => setStepInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  title="How much the quantity increases per click (e.g. 0.5 for half kg, 1 for whole pieces)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">E.g., 0.5 or 1</p>
              </div>

              <div>
                <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-1 text-red-800">
                  Minimum Order
                </label>
                <input
                  id="minQuantity" type="number" step="0.01" min="0.01" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  title="The smallest amount a customer can order (e.g. 0.5 for half kg, 1 for whole pieces)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">E.g., 0.5 or 1</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 text-white font-bold rounded-lg transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 cursor-pointer select-none"
              style={{ backgroundColor: SHOP_CONFIG.themeColor }}
            >
              {uploading ? 'Saving in progress...' : (editingId ? 'Update Product' : 'Add to Menu')}
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="md:col-span-2 space-y-3">
          {products.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
              No products yet. Add your first sweet!
            </div>
          ) : (
            products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
              <div
                key={product.id}
                className={`bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 transition-all ${product.is_out_of_stock ? 'opacity-60 grayscale' : 'hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200 relative">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-2 flex-wrap">
                      {product.name}
                      {product.is_out_of_stock && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                          Out of Stock
                        </span>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 truncate">
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs mr-2">{product.category || 'Sweets'}</span>
                      {SHOP_CONFIG.currency}{product.price} / {product.unit}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => toggleStockStatus(product.id, product.is_out_of_stock)}
                    className={`p-2 rounded-md transition-colors ${product.is_out_of_stock
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                    title={product.is_out_of_stock ? "Mark In Stock" : "Mark Out of Stock"}
                  >
                    {product.is_out_of_stock ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </button>

                  <button
                    onClick={() => handleEditClick(product)}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                    title="Edit Product"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}