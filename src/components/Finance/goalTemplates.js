import { CarFront, Gift, GraduationCap, Heart, House, Plane, Smartphone, Target } from 'lucide-react';

export const GOAL_TEMPLATES = {
  Travel: { icon: 'Plane', colorToken: '--section-available', Icon: Plane },
  Gadget: { icon: 'Smartphone', colorToken: '--section-categories', Icon: Smartphone },
  Vehicle: { icon: 'CarFront', colorToken: '--section-note', Icon: CarFront },
  Education: { icon: 'GraduationCap', colorToken: '--section-income', Icon: GraduationCap },
  Wedding: { icon: 'Heart', colorToken: '--section-expense', Icon: Heart },
  Home: { icon: 'House', colorToken: '--section-note', Icon: House },
  Gift: { icon: 'Gift', colorToken: '--section-outflow', Icon: Gift },
  Custom: { icon: 'Target', colorToken: '--section-trading', Icon: Target },
};

export const GOAL_TYPES = Object.keys(GOAL_TEMPLATES);
export const GOAL_COLOR_PALETTE = [
  { label: 'Green', colorToken: '--section-goal-savings' },
  { label: 'Terracotta', colorToken: '--section-expense' },
  { label: 'Teal', colorToken: '--section-available' },
  { label: 'Slate blue', colorToken: '--section-categories' },
  { label: 'Ochre', colorToken: '--section-note' },
  { label: 'Plum', colorToken: '--section-outflow' },
];
export const GOAL_ICONS = Object.entries(GOAL_TEMPLATES).map(([label, template]) => ({
  label,
  icon: template.icon,
  Icon: template.Icon,
}));
