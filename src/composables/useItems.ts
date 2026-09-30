import { ref } from 'vue';
import { Bath, BedDouble, Briefcase, Coffee, Heart, Package, PackageCheck, ShoppingCart, Sofa, Sparkles, Trees } from 'lucide-vue-next';
import { supabase, uploadImage } from '../supabase';

// ── Types ──────────────────────────────────────────────────────────────
export interface Item {
    id: string;
    name: string;
    category: string;
    order_date: string;
    price: number;
    amount: number;
    image: string;
    url: string;
    status: string;
}

export interface FormData {
    name: string;
    category: string;
    order_date: string;
    price: string;
    amount: string;
    image: string;
    url: string;
    status: string;
}

// ── Constants ──────────────────────────────────────────────────────────
// Colors live in theme.scss as `.status--{key}`
export const STATUSES = [
    { key: 'gewenst', label: 'Gewenst', Icon: Heart },
    { key: 'besteld', label: 'Besteld', Icon: ShoppingCart },
    { key: 'ontvangen', label: 'Ontvangen', Icon: PackageCheck },
];

export const CATEGORY_ICONS: Record<string, unknown> = {
    Keuken: Coffee,
    Slaapkamer: BedDouble,
    Badkamer: Bath,
    Woonkamer: Sofa,
    Kantoor: Briefcase,
    Tuin: Trees,
    'Was & Schoonmaak': Sparkles,
};

export const DEFAULT_CATEGORIES = ['Keuken', 'Slaapkamer', 'Badkamer', 'Woonkamer', 'Was & Schoonmaak', 'Kantoor', 'Overig'];

export const EMPTY_FORM: FormData = {
    name: '',
    category: 'Keuken',
    order_date: '',
    price: '',
    amount: '1',
    image: '',
    url: '',
    status: 'gewenst',
};

// ── Helpers ────────────────────────────────────────────────────────────
export const statusOf = (key: string) => STATUSES.find(status => status.key === key) || STATUSES[0];
export const categoryIcon = (category: string) => CATEGORY_ICONS[category] || Package;
export const formatPrice = (value: number, fractionDigits = 2) =>
    value.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });

// ── Singleton state ────────────────────────────────────────────────────
const items = ref<Item[]>([]);
const categories = ref<string[]>([]);
const loading = ref(true);
const activeCategory = ref('Alle');
const activeStatus = ref('Alle');

// ── Composable ─────────────────────────────────────────────────────────
export function useItems() {
    const fetchItems = async () => {
        const [{ data: itemData }, { data: categoryData }] = await Promise.all([
            supabase.from('items').select('*').order('created_at', { ascending: false }),
            supabase.from('categories').select('name').order('name'),
        ]);
        items.value = (itemData ?? []) as Item[];
        categories.value = categoryData?.map((category: { name: string }) => category.name) ?? DEFAULT_CATEGORIES;
        loading.value = false;
    };

    const saveItem = async (form: FormData, editId: string | null) => {
        if (!form.name.trim()) return false;
        const item = {
            ...form,
            price: parseFloat(form.price.replace(',', '.')) || 0,
            amount: parseInt(form.amount) || 1,
            order_date: form.order_date || null,
            id: editId || crypto.randomUUID(),
        };
        const { error } = await supabase.from('items').upsert(item);
        if (error) { console.error('saveItem error:', error); return false; }
        const savedItem = { ...item, order_date: item.order_date ?? '' };
        if (editId) {
            items.value = items.value.map(existing => existing.id === editId ? { ...existing, ...savedItem } : existing);
        } else {
            items.value = [savedItem, ...items.value];
        }
        return true;
    };

    const deleteItem = async (id: string) => {
        await supabase.from('items').delete().eq('id', id);
        items.value = items.value.filter(item => item.id !== id);
    };

    const addCategory = async (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName || categories.value.includes(trimmedName)) return false;
        await supabase.from('categories').insert({ name: trimmedName });
        categories.value = [...categories.value, trimmedName];
        return true;
    };

    const saveCategory = async (index: number, newName: string) => {
        const trimmedName = newName.trim();
        const previousName = categories.value[index];
        if (!trimmedName || (categories.value.includes(trimmedName) && trimmedName !== previousName)) return false;
        if (trimmedName === previousName) return true;
        await supabase.from('categories').update({ name: trimmedName }).eq('name', previousName);
        await supabase.from('items').update({ category: trimmedName }).eq('category', previousName);
        categories.value = categories.value.map((category, idx) => idx === index ? trimmedName : category);
        items.value = items.value.map(item => item.category === previousName ? { ...item, category: trimmedName } : item);
        if (activeCategory.value === previousName) activeCategory.value = trimmedName;
        return true;
    };

    const deleteCategory = async (index: number) => {
        const categoryName = categories.value[index];
        await supabase.from('categories').delete().eq('name', categoryName);
        categories.value = categories.value.filter((_, idx) => idx !== index);
        if (activeCategory.value === categoryName) activeCategory.value = 'Alle';
    };

    return {
        items,
        categories,
        loading,
        activeCategory,
        activeStatus,
        fetchItems,
        saveItem,
        deleteItem,
        addCategory,
        saveCategory,
        deleteCategory,
        uploadImage,
    };
}
