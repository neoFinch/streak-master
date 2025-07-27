import Marquee from "react-fast-marquee";
import { TaskV2 } from "../store";
import { dayToNumber } from "../utils/time-utils";
import { use, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface SlotComponentProps {
  index: number;
  taskIndex: number;
  task: TaskV2;
  slot: { startTime: string; endTime: string; tasks: TaskV2[] };
  openModelForEdit: (
    task: TaskV2,
    slot: { startTime: string; endTime: string; tasks: TaskV2[] },
    slotIndex: number,
    taskIndex: number
  ) => void;
}

export const SlotComponent = ({
  index,
  taskIndex,
  task,
  slot,
  openModelForEdit,
}: SlotComponentProps) => {
  let diff = dayToNumber[task.endDay] - dayToNumber[task.startDay];
  console.log({diff, task});

  return (
    <div
      // ref={containerRef}
      className="slot-and-task-container"
      key={`slot-` + index + `-task-` + taskIndex}
      style={{
        gridColumn: `${dayToNumber[task.startDay]}/${
          dayToNumber[task.endDay] + 1
        }`,
        minWidth: `calc(100vw/7)`,
      }}
      onClick={() => openModelForEdit(task, slot, index, taskIndex)}
    >
      {
        diff < 1 ? (
          <Marquee speed={20}>
            <div className="time-slot">
              {slot.startTime + " - " + slot.endTime}
            </div>
          </Marquee>
        ) : (
          <div className="time-slot">
            {slot.startTime + " - " + slot.endTime}
          </div>
        )
      }
      {/* <div className="time-slot">
        {slot.startTime + " - " + slot.endTime}
      </div> */}

      <div className="task-container">
        <div key={`task-` + taskIndex} className="task-title">
          {
            diff < 1 ? (
              <Marquee speed={20}>
                {task.title}
              </Marquee>
            ) : (
              task.title
            )
          }
          {/* {task.title} */}
        </div>
      </div>
    </div>
  );
};
