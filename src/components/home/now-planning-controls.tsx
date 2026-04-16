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
      <div className="space-y-5 rounded-[26px] border border-white/18 bg-white/10 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-white/70">Tune the brief</p>
            <p className="text-sm text-white/82">
              Change origin, trip length, or start date — rankings recompute.
            </p>
          </div>
          <button type="submit" className={buttonVariants({ variant: "surface", size: "sm" })}>
            Update
          </button>
        </div>

        <SegmentedRow
          name="origin"
          legend="Starting from"
          selected={state.origin}
          options={originOptions}
        />

        <SegmentedRow
          name="tripLength"
          legend="Trip length"
          selected={state.tripLength}
          options={tripLengthOptions}
        />

        <div>
          <label
            htmlFor="now-start-date"
            className="block text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-white/72"
          >
            Start date
          </label>
          <input
            id="now-start-date"
            name="startDate"
            type="date"
            defaultValue={state.startDate ?? ""}
            className="mt-2 h-10 w-full max-w-xs rounded-full border border-white/25 bg-white/12 px-4 text-sm text-white placeholder:text-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          />
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
      <legend className="text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-white/72">
        {legend}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const inputId = `${name}-${option.id}`;
          const isSelected = selected === option.id;
          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={
                isSelected
                  ? "cursor-pointer rounded-full border border-white/60 bg-white px-3 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-foreground"
                  : "cursor-pointer rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-white/78 hover:bg-white/18"
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
