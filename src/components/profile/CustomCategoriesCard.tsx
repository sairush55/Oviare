'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useCycleData } from '@/context/CycleDataContext';
import { CustomCategoryItem } from '@/types';
import {
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const CustomCategoriesCard: React.FC = () => {
  const {
    customCategories,
    addCustomCategoryItem,
    renameCustomCategoryItem,
    toggleCustomCategoryItem,
    removeCustomCategoryItem,
  } = useCycleData();

  // New Category Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'symptom' | 'wellness'>('symptom');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rename Modal State
  const [editingItem, setEditingItem] = useState<CustomCategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<CustomCategoryItem | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = newName.trim();
    if (!trimmed) {
      setFormError('Please enter a category name.');
      return;
    }
    if (trimmed.length > 40) {
      setFormError('Category name must be 40 characters or fewer.');
      return;
    }

    setIsSubmitting(true);
    const res = await addCustomCategoryItem(trimmed, newType);
    if (!res.success && res.error) {
      setFormError(res.error);
    } else {
      setNewName('');
      setNewType('symptom');
    }
    setIsSubmitting(false);
  };

  const handleSaveRename = async () => {
    if (!editingItem) return;
    setEditError(null);

    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Category name cannot be empty.');
      return;
    }

    const res = await renameCustomCategoryItem(editingItem.id, trimmed);
    if (!res.success && res.error) {
      setEditError(res.error);
    } else {
      setEditingItem(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    await removeCustomCategoryItem(deletingItem.id);
    setDeletingItem(null);
  };

  return (
    <Card variant="default" padding="md" className="space-y-5">
      <CardHeader
        title="Custom Tracking Categories"
        subtitle="Define personal bodily symptoms or lifestyle wellness indicators"
        action={
          <Badge variant="sage" size="sm">
            {customCategories.length} Custom {customCategories.length === 1 ? 'Item' : 'Items'}
          </Badge>
        }
      />

      {/* Add Category Form */}
      <form
        onSubmit={handleAddCategory}
        className="p-4 rounded-xl bg-ivory-50/70 border border-oviareBorder space-y-3"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
          Add New Custom Category
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setFormError(null);
              }}
              maxLength={40}
              placeholder="e.g. Lower back tension, Hydration goal, Herbal tea..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-oviareBorder bg-white text-oviareText-primary placeholder:text-oviareText-muted focus-visible:outline-plum"
            />
            <div className="flex justify-between text-[10px] text-oviareText-muted px-1">
              <span>Must be 40 characters or fewer</span>
              <span>{newName.length}/40</span>
            </div>
          </div>

          <div>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'symptom' | 'wellness')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-oviareBorder bg-white text-oviareText-primary focus-visible:outline-plum"
            >
              <option value="symptom">Physical Symptom</option>
              <option value="wellness">Wellness Marker</option>
            </select>
          </div>
        </div>

        {formError && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {formError}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Category
          </Button>
        </div>
      </form>

      {/* Categories List */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-oviareText-secondary block">
          Your Categories
        </span>

        {customCategories.length === 0 ? (
          <div className="p-6 text-center text-xs text-oviareText-secondary rounded-xl bg-ivory-100/50 border border-oviareBorder border-dashed">
            <Tag className="w-6 h-6 text-mauve-dark mx-auto mb-1.5 opacity-60" />
            <p>No custom categories created yet. Add one above to personalize your check-in options.</p>
          </div>
        ) : (
          <div className="divide-y divide-oviareBorder/60 border border-oviareBorder rounded-xl bg-white overflow-hidden">
            {customCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 gap-3 hover:bg-ivory-50/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleCustomCategoryItem(cat.id, !cat.is_active)}
                    title={cat.is_active ? 'Click to pause category' : 'Click to enable category'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      cat.is_active
                        ? 'bg-sage/10 text-sage border-sage/30 hover:bg-sage/20'
                        : 'bg-ivory-200 text-oviareText-muted border-oviareBorder hover:bg-ivory-300'
                    }`}
                  >
                    {cat.is_active ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span
                      className={`text-xs font-medium block truncate ${
                        cat.is_active
                          ? 'text-oviareText-primary'
                          : 'text-oviareText-muted line-through'
                      }`}
                    >
                      {cat.symptom_name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-oviareText-secondary">
                        {cat.category_type === 'symptom' ? 'Symptom' : 'Wellness'}
                      </span>
                      <span className="text-[10px] text-oviareText-muted">•</span>
                      <span className="text-[10px] text-oviareText-muted">
                        {cat.is_active ? 'Active in log' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(cat);
                      setEditName(cat.symptom_name);
                      setEditError(null);
                    }}
                    className="p-1.5 rounded-lg text-oviareText-secondary hover:text-plum hover:bg-mauve/20 transition-colors"
                    title="Rename category"
                    aria-label="Rename category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(cat)}
                    className="p-1.5 rounded-lg text-oviareText-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete category"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Rename Custom Category"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-oviareText-primary block">
              Category Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError(null);
              }}
              maxLength={40}
              className="w-full px-3 py-2 text-xs rounded-xl border border-oviareBorder bg-white text-oviareText-primary focus-visible:outline-plum"
            />
          </div>

          {editError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
              {editError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-oviareBorder">
            <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveRename}>
              Save Name
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Remove Custom Category"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">
                Remove &ldquo;{deletingItem?.symptom_name}&rdquo;?
              </span>
              <p>
                This will remove the category from future daily check-in options. Any previous daily logs that recorded this item will retain their historical entries safely.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-oviareBorder">
            <Button variant="ghost" size="sm" onClick={() => setDeletingItem(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
