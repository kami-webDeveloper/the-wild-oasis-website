import { auth } from "../_lib/auth";
import { getBookedDatesByCabinId, getSettings } from "../_lib/data-service";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";

async function Reservation({ id, maxCapacity, regularPrice, discount }) {
  const [bookedDates, { minBookingLength, maxBookingLength }] =
    await Promise.all([getBookedDatesByCabinId(id), getSettings()]);

  const session = await auth();

  return (
    <div className="grid grid-cols-2 border border-primary-800 min-h-[400px]">
      <DateSelector
        regularPrice={regularPrice}
        discount={discount}
        minBookingLength={minBookingLength}
        maxBookingLength={maxBookingLength}
        bookedDates={bookedDates}
      />
      {session?.user ? (
        <ReservationForm
          maxCapacity={maxCapacity}
          regularPrice={regularPrice}
          discount={discount}
          cabinId={id}
          user={session?.user}
        />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
