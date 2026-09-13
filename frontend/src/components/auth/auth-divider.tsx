type DeviderProps = {
  text: string;
};

export const Divider = ({ text }: DeviderProps) => {
  return (
    <div className="my-7 flex items-center gap-4">
      <div className="bg-border h-px flex-1" />
      <span className="text-muted-foreground shrink-0 text-xs font-medium">{text}</span>
      <div className="bg-border h-px flex-1" />
    </div>
  );
};

export default Divider;
