import { buttonVariants } from "@/components/ui/button";
import {
  originOptions,
  tripLengthOptions,
  type Origin,
  type TripLength,
} from "@/lib/data/openseason";
import type { PlanningState } from "@/lib/planning";

type NowPlanningControlsProps = Readonly<{
  state: PlanningState;
  action?: string;
  className?: string;
}>;

export function NowPlanningControls({
  state,
  action = "/",
  className,
}: NowPlanningControlsProps) {
  return (
    <form
      action={action}
      method="get"
      aria-label="Update the current trip brief"
      className={className}
    >
      <div className="space-y-4">
        <SegmentedRow
          name="origin"
          legend="From"
          selected={state.origin}
          options={originOptions}
        />

        <SegmentedRow
          name="tripLength"
          legend="Length"
          selected={state.tripLength}
          options={tripLengthOptions}
        />

        <div>
          <label
            htmlFor="now-start-date"
            className="block text-xs text-muted"
          >
            Start date
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="now-start-date"
              name="startDate"
              type="date"
              defaultValue={state.startDate ?? ""}
              className="h-9 flex-1 rounded-md border border-line bg-background px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean/35"
            />
            <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Update
            </button>
          </div>
        </div>
      </div>

      <input type="hidden" name="drivingTolerance" value={state.drivingTolerance} />
      <input type="hidden" name="groupProfile" value={state.groupProfile} />
      <input type="hidden" name="tripFormat" value={state.tripFormat} />
      <input type="hidden" name="tripIntensity" value={state.tripIntensity} />
      <input type="hidden" name="lodgingStyle" value={state.lodgingStyle} />
      <input type="hidden" name="interestMode" value={state.interestMode} />
      {state.interestMode === "specific"
        ? state.interests.map((interest) => (
            <input key={interest} type="hidden" name="interests" value={interest} />
          ))
        : null}
    </form>
  );
}

type SegmentedRowProps<TValue extends string> = Readonly<{
  name: string;
  legend: string;
  selected: TValue;
  options: ReadonlyArray<{ id: TValue; label: string }>;
}>;

function SegmentedRow<TValue extends Origin | TripLength>({
  name,
  legend,
  selected,
  options,
}: SegmentedRowProps<TValue>) {
  return (
    <fieldset>
      <legend className="text-xs text-muted">{legend}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const inputId = `${name}-${option.id}`;
          const isSelected = selected === option.id;
          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={
                isSelected
                  ? "cursor-pointer rounded-md border border-foreground bg-foreground px-2.5 py-1 text-xs font-medium text-background"
                  : "cursor-pointer rounded-md border border-line bg-transparent px-2.5 py-1 text-xs font-medium text-foreground hover:border-foreground/50"
              }
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={option.id}
                defaultChecked={isSelected}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
