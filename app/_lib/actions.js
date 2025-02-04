"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

// Signin action
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

// Signout action
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// Updating profile action
export async function updateGuest(formData) {
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("National ID must be valid");

  const updateData = {
    nationalID,
    nationality,
    countryFlag,
  };

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

// Deleting a reservation
export async function deleteReservation(bookingId) {
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You Can't delete this booking!");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("account/reservation");
}

// Editing a reservation
export async function updateReservation(formData) {
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  const bookingId = +formData.get("bookingId");
  const numGuests = +formData.get("numGuests");
  const observations = formData.get("observations");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You Can't edit this booking!");

  const updateData = {
    numGuests,
    observations,
  };

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be updated");

  revalidatePath(`account/reservations/edit/${bookingId}`);

  redirect("/account/reservations");
}

// Creating a reservation
export async function createReservation(reservationData, formData) {
  const session = await auth();

  if (!session) throw new Error("You must be logged in");

  console.log(formData);

  const newReservation = {
    ...reservationData,
    guestId: session.user.guestId,
    numGuests: +formData.get("numGuests"),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: reservationData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newReservation]);

  if (error) throw new Error("Booking could not be created");

  revalidatePath(`/cabins/${reservationData.cabinId}`);

  redirect("/cabins/thankyou");
}
