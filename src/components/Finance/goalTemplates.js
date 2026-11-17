import { CarFront, Gift, GraduationCap, Heart, House, Plane, Smartphone, Target } from 'lucide-react';

export const GOAL_TEMPLATES = {
  Travel: { icon: 'Plane', color: '#628b78', Icon: Plane },
  Gadget: { icon: 'Smartphone', color: '#7185a6', Icon: Smartphone },
  Vehicle: { icon: 'CarFront', color: '#9b7955', Icon: CarFront },
  Education: { icon: 'GraduationCap', color: '#6f8b62', Icon: GraduationCap },
  Wedding: { icon: 'Heart', color: '#a16f7e', Icon: Heart },
  Home: { icon: 'House', color: '#9a795d', Icon: House },
  Gift: { icon: 'Gift', color: '#8a7192', Icon: Gift },
  Custom: { icon: 'Target', color: '#789b68', Icon: Target },
};

export const GOAL_TYPES = Object.keys(GOAL_TEMPLATES);
export const GOAL_ICONS = Object.entries(GOAL_TEMPLATES).map(([label, template]) => ({
  label,
  icon: template.icon,
  Icon: template.Icon,
}));
