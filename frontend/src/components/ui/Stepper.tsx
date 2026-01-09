// components/ui/Stepper.tsx

interface StepperProps {
  currentStep: number;
}

const Stepper = ({ currentStep }: StepperProps) => {
  const steps = ["Putovanje", "Rezultati", "Detalji", "Plaćanje"];

  return (
    <div className="w-full overflow-x-auto bg-white p-6 rounded-2xl border border-base-200 shadow-sm">
      <ul className="steps steps-vertical lg:steps-horizontal w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <li
              key={index}
              className={`step transition-all duration-500 ${
                index <= currentStep
                  ? "step-primary font-bold"
                  : "text-base-content/40"
              }`}
              // data-content automatski koristi primarnu boju zbog klase step-primary
              data-content={isCompleted ? "✓" : index + 1}
            >
              <span
                className={`text-[10px] md:text-xs uppercase tracking-widest mt-2 transition-colors duration-500 ${
                  index <= currentStep ? "text-primary" : "text-base-content/40"
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Stepper;
