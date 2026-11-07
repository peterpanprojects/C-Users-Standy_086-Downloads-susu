import { GroupMember, PayoutScheduleWeek, PayoutWeekStatus } from '../types/susu';
import { addDays, formatDateStr, isPast } from './dates';

/**
 * Recalculate or generate N payout schedule weeks for a Susu Group
 */
export function generatePayoutSchedule(
  groupId: string,
  cycleStartDate: string,
  members: GroupMember[],
  fixedDailyAmount: number,
  cycleSlotsCount?: number
): PayoutScheduleWeek[] {
  const maxAssignedPos = members.length > 0
    ? Math.max(...members.map((m) => m.positionInRotation || 0), 0)
    : 0;

  // Cycle has at least 6 slots, or enough for all members plus open available slots
  const totalSlots = cycleSlotsCount || Math.max(maxAssignedPos + (maxAssignedPos < 8 ? 2 : 1), Math.max(members.length + 2, 6));

  const N = Math.max(members.length, 1);
  const expectedPoolAmount = fixedDailyAmount * 7 * N;
  const todayStr = formatDateStr(new Date());

  const weeks: PayoutScheduleWeek[] = [];

  for (let i = 0; i < totalSlots; i++) {
    const weekNumber = i + 1;
    const weekStartDate = addDays(cycleStartDate, i * 7);
    const weekEndDate = addDays(weekStartDate, 6);

    const assignedMember = members.find((m) => m.positionInRotation === weekNumber);

    let status: PayoutWeekStatus = 'upcoming';
    if (todayStr > weekEndDate) {
      status = 'paid_out';
    } else if (todayStr >= weekStartDate && todayStr <= weekEndDate) {
      status = 'current';
    } else {
      status = 'upcoming';
    }

    weeks.push({
      id: `schedule-week-${weekNumber}`,
      groupId,
      memberId: assignedMember ? assignedMember.id : '',
      memberName: assignedMember ? assignedMember.name : 'Available Slot',
      weekNumber,
      weekStartDate,
      weekEndDate,
      status,
      expectedPoolAmount,
      isAvailable: !assignedMember
    });
  }

  return weeks;
}

/**
 * Reorder members in rotation queue.
 * Only positions from active/current week onwards can be swapped.
 */
export function reorderRotationQueue(
  members: GroupMember[],
  fromIndex: number,
  toIndex: number,
  currentWeekIndex: number = 0
): GroupMember[] {
  // Disallow reordering locked past/current weeks
  if (fromIndex < currentWeekIndex || toIndex < currentWeekIndex) {
    return members;
  }

  const updated = [...members];
  const [movedItem] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, movedItem);

  return updated.map((member, idx) => ({
    ...member,
    positionInRotation: idx + 1
  }));
}

/**
 * Shuffle future rotation positions randomly
 */
export function shuffleFutureRotation(
  members: GroupMember[],
  currentWeekIndex: number = 0
): GroupMember[] {
  const lockedMembers = members.filter((_, idx) => idx < currentWeekIndex);
  const futureMembers = members.filter((_, idx) => idx >= currentWeekIndex);

  // Fisher-Yates shuffle for future members
  for (let i = futureMembers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [futureMembers[i], futureMembers[j]] = [futureMembers[j], futureMembers[i]];
  }

  const combined = [...lockedMembers, ...futureMembers];
  return combined.map((member, idx) => ({
    ...member,
    positionInRotation: idx + 1
  }));
}
