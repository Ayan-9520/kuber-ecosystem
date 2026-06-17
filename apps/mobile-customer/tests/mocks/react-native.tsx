import React from 'react';

export const Platform = { OS: 'web', select: <T,>(o: { web?: T; default?: T }) => o.web ?? o.default };

export const Dimensions = {
  get: () => ({ width: 390, height: 844, scale: 2, fontScale: 1 }),
};

export const Alert = { alert: jest.fn() };

export const ActivityIndicator = () => null;

export const Pressable = ({
  children,
  onPress,
  disabled,
}: {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) => (
  <button type="button" disabled={disabled} onClick={onPress}>
    {children}
  </button>
);

export const ScrollView = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const RefreshControl = () => null;
export const FlatList = ({
  data = [],
  renderItem,
}: {
  data?: unknown[];
  renderItem?: (info: { item: unknown }) => React.ReactNode;
}) => (
  <div>{data.map((item, index) => <div key={index}>{renderItem?.({ item })}</div>)}</div>
);
export const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;
export const KeyboardAvoidingView = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const Modal = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

export const StyleSheet = { create: <T extends Record<string, unknown>>(styles: T) => styles };
export const Text = ({ children }: { children?: React.ReactNode }) => <span>{children}</span>;
export const View = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
