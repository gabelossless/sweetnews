import { Product } from '../types';

export const categories = [
  { id: 'all', name: 'All', icon: '✨' },
  { id: 'exotic', name: 'Exotic Finds', icon: '🌏' },
  { id: 'organic', name: 'Organic & Fresh', icon: '🌱' },
  { id: 'drinks', name: 'Craft Drinks', icon: '🥤' },
  { id: 'local', name: 'Local Deli', icon: '🥪' },
  { id: 'sweet', name: 'Sweets', icon: '🍬' }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Wagyu Katsu Sando',
    description: 'A5 Wagyu, milk bread, tonkatsu',
    price: 24.50,
    tag: 'Premium',
    image: 'https://images.unsplash.com/photo-1627907228175-2bf8ec2c8dd6?q=80&w=600&auto=format&fit=crop',
    categoryId: 'local'
  },
  {
    id: '2',
    name: 'Truffle Burrata Toast',
    description: 'Fresh burrata, black truffle honey',
    price: 14.00,
    tag: 'Fresh',
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=600&auto=format&fit=crop',
    categoryId: 'local'
  },
  {
    id: '3',
    name: 'Cold-Pressed Green Detox',
    description: 'Kale, Celery, Apple, Ginger',
    price: 8.50,
    tag: 'Organic',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop',
    categoryId: 'drinks'
  },
  {
    id: '4',
    name: 'Dragonfruit Chips',
    description: 'Exotic & crispy dehydrated fruit',
    price: 6.99,
    tag: 'Exotic',
    image: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&auto=format&fit=crop',
    categoryId: 'exotic'
  },
  {
    id: '5',
    name: 'Gold Leaf Macarons',
    description: 'Pistachio & Rosewater (Set of 6)',
    price: 18.00,
    tag: 'Imported',
    image: 'https://images.unsplash.com/photo-1569864358641-52bfa353a1bf?q=80&w=600&auto=format&fit=crop',
    categoryId: 'sweet'
  },
  {
    id: '6',
    name: 'Alkaline Glacier Water',
    description: 'pH 9.5 natural springs',
    price: 4.50,
    tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1553531087-b25a0b9a68ab?q=80&w=600&auto=format&fit=crop',
    categoryId: 'drinks'
  },
  {
    id: '7',
    name: 'Organic Acai Bowl',
    description: 'Topped with goji berries & chia',
    price: 12.00,
    tag: 'Healthy',
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?q=80&w=600&auto=format&fit=crop',
    categoryId: 'organic'
  },
  {
    id: '8',
    name: 'Activated Charcoal Lemonade',
    description: 'Detoxing citrus blend',
    price: 8.00,
    tag: 'Cleanse',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop',
    categoryId: 'drinks'
  },
  {
    id: '9',
    name: 'Heirloom Tomato Salad',
    description: 'Balsamic glaze & feta',
    price: 13.50,
    tag: 'Fresh',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
    categoryId: 'organic'
  },
  {
    id: '10',
    name: 'Sea Salt Dark Choc',
    description: '70% Fair-trade cocoa',
    price: 7.25,
    tag: null,
    image: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?q=80&w=600&auto=format&fit=crop',
    categoryId: 'sweet'
  }
];
