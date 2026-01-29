import React from 'react';
import { TouchableOpacity, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  loading?: boolean;
}

import { BitervaLoader } from '../BitervaLoader';

export const Button = ({ onPress, title, variant = 'primary', className, loading }: ButtonProps) => {
  const baseStyle = "p-4 rounded-xl items-center justify-center active:opacity-80";
  const variants = {
    primary: "bg-blue-600",
    secondary: "bg-gray-700",
    danger: "bg-red-500",
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={cn(baseStyle, variants[variant], className)}
      disabled={loading}
    >
      {loading ? <BitervaLoader size={24} /> : <Text className="text-white font-bold text-lg">{title}</Text>}
    </TouchableOpacity>
  );
};

interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-400 mb-2 font-medium">{label}</Text>}
      <TextInput 
        className={cn("bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500", className)}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </View>
  );
};

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <View className={cn("bg-gray-900 rounded-2xl p-6 border border-gray-800", className)}>
      {children}
    </View>
  );
};
