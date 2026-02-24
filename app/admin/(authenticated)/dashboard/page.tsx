// app/admin/(authenticated)/dashboard/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG } from '@/lib/config';
import { Trash2, PackagePlus, Edit2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  is_out_of_stock: boolean;
  step_interval: number;
  min_quantity: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
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
    fetchProducts();
  }, [fetchProducts]);

  // Handle Image Selection
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  // Upload image to Supabase Storage
  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

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
      // Update existing item
      const updateData: Record<string, unknown> = {
        name,
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

      if (error) alert('Error updating product: ' + error.message);
    } else {
      // Insert new item
      const { error } = await supabase.from('products').insert([
        {
          name,
          price: parseFloat(price),
          unit,
          image_url: imageUrl,
          step_interval: parseFloat(stepInterval),
          min_quantity: parseFloat(minQuantity)
        },
      ]);
      if (error) alert('Error adding product: ' + error.message);
    }

    setUploading(false);
    resetForm();
    fetchProducts();
  }

  function handleEditClick(product: Product) {
    setEditingId(product.id);
    setName(product.name);
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
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert('Error deleting product: ' + error.message);
    else fetchProducts();
  }

  async function toggleStockStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_out_of_stock: !currentStatus })
      .eq('id', id);

    if (error) alert('Error updating stock status: ' + error.message);
    else fetchProducts();
  }

  if (loading) return <div className="text-gray-500">Loading products...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Products Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Add/Edit Product Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold flex items-center gap-2 text-gray-800">
              {editingId ? <Edit2 size={20} /> : <PackagePlus size={20} />}
              {editingId ? 'Edit Sweet' : 'Add New Sweet'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-red-500 hover:underline">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ height: '150px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="h-full object-cover" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-sm">Click to upload image</span>
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Kaju Katli" required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ({SHOP_CONFIG.currency})
                </label>
                <input
                  id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="400" required
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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

            {/* NEW: Step Interval and Min Quantity */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
              <div>
                <label htmlFor="stepInterval" className="block text-sm font-medium text-gray-700 mb-1 text-blue-800">
                  Step Interval
                </label>
                <input
                  id="stepInterval" type="number" step="0.01" min="0.01" value={stepInterval} onChange={(e) => setStepInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  title="How much the quantity increases per click (e.g. 0.5 for half kg, 1 for whole pieces)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">E.g., 0.5 or 1</p>
              </div>

              <div>
                <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-1 text-blue-800">
                  Minimum Order
                </label>
                <input
                  id="minQuantity" type="number" step="0.01" min="0.01" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  title="The smallest amount a customer can order (e.g. 0.5 for half kg, 1 for whole pieces)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">E.g., 0.5 or 1</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 text-white font-bold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
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
            products.map((product) => (
              <div
                key={product.id}
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-all ${product.is_out_of_stock ? 'opacity-60 grayscale' : 'hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      {product.name}
                      {product.is_out_of_stock && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                          Out of Stock
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                      {SHOP_CONFIG.currency}{product.price} / {product.unit}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
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
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
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