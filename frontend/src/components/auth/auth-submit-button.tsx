export const AuthSubmitButton = () => {
  return (
    <button
      type="button"
      onClick={goToDetails}
      className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 focus-visible:ring-ring/30 mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0"
    >
      Continue
      {icon}
    </button>
  );
};
