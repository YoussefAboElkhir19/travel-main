<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Flight;
use App\Models\Reservation;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reservations = Reservation::with('customer','reservable')->get()->each(function($reservation) {
            $reservation->reservable_type = str_replace('App\\Models\\', '', $reservation->reservable_type);
        });
        if ($reservations->isEmpty()) {
            return response()->json(['message' => 'No reservations found'], 404);
        }
        return response()->json($reservations, 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // return $request;
        $request->validate([
            'name' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'type' => 'required|string|max:50|in:Flight,Hotel,Cruise,Transportation,Visa,Insurance,Ticket,Appointment',
        ]);
        $customer = Customer::Create(
            [
                'name' => $request->name,
                'phone' => $request->phoneNumber,
            ]
        );
        $type = $request->type;
        switch ($type) {
            case 'Flight':
                $request->validate([
                    'flight_number' => 'required|string|max:50',
                    'departure_date' => 'required|date',
                    'arrival_date' => 'required|date',
                    'from_airport' => 'required|string|max:50',
                    'to_airport' => 'required|string|max:50',
                    'airline' => 'required|string|max:50',
                    'status' => 'string|max:50|in:Confimed,Pending,Cancelled',
                    'notes' => 'required|string',
                ]);
                $flight = new \App\Models\Flight();
                $flight->flight_number = $request->flight_number;
                $flight->departure_date = $request->departure_date;
                $flight->arrival_date = $request->arrival_date;
                $flight->from_airport = $request->from_airport;
                $flight->to_airport = $request->to_airport;
                $flight->airline = $request->airline;
                // $flight->status = $request->status;
                $flight->status = 'Pending';
                $flight->notes = $request->notes;
                $flight->save();
                $reservable = $flight;
                break;
            case 'Hotel':
                $request->validate([
                    'hotelName' => 'required|string|max:255',
                    'BookingNumber' => 'required|string|max:50',
                    'check_in_date' => 'required|date',
                    'check_out_date' => 'required|date|after:check_in_date',
                    'NumberOfGeust' => 'required|integer|min:1',
                    'NumberOfRoom' => 'required|integer|min:1',
                    'roomType' => 'required|string|max:50',
                    // 'status' => 'string|in:Confirmed,Pending,Cancelled',
                    'notes' => 'nullable|string',
                ]);
                $hotel = new \App\Models\Hotel();
                $hotel->name = $request->hotelName;
                $hotel->booking_number = $request->BookingNumber;
                $hotel->check_in_date = $request->check_in_date;
                $hotel->check_out_date = $request->check_out_date;
                $hotel->number_of_guests = $request->NumberOfGeust;
                $hotel->number_of_rooms = $request->NumberOfRoom;
                $hotel->room_type = $request->roomType;
                // $hotel->status = $request->status ?? 'Pending';
                $hotel->notes = $request->notes;
                $hotel->save();
                $reservable = $hotel;
                break;
            case 'Cruise':
                $request->validate([
                    'cruise_name' => 'required|string|max:255',
                    'ship_name' => 'required|string|max:255',
                    'cabin_type' => 'required|string|max:50',
                    'departure_date' => 'required|date',
                    'arrival_date' => 'required|date',
                    'departure_port' => 'required|string|max:255',
                    'arrival_port' => 'required|string|max:255',
                    'cruise_line' => 'required|string|max:255',
                    'status' => 'string|max:50|in:Confirmed,Pending,Cancelled',
                    'notes' => 'nullable|string',
                ]);
                $cruise = new \App\Models\Cruise();
                $cruise->cruise_name = $request->cruise_name;
                $cruise->ship_name = $request->ship_name;
                $cruise->cabin_type = $request->cabin_type;
                $cruise->departure_date = $request->departure_date;
                $cruise->arrival_date = $request->arrival_date;
                $cruise->departure_port = $request->departure_port;
                $cruise->arrival_port = $request->arrival_port;
                $cruise->cruise_line = $request->cruise_line;
                $cruise->status = $request->status ?? 'Pending';
                $cruise->notes = $request->notes;
                $cruise->save();
                $reservable = $cruise;
                break;
            case 'Transportation':
                $request->validate([
                    'transport_type' => 'required|string|max:50',
                    'departure_date' => 'required|date',
                    'arrival_date' => 'required|date',
                    'pickup_location' => 'required|string|max:255',
                    'dropoff_location' => 'required|string|max:255',
                    'passenger_count' => 'required|integer|min:1',
                    'status' => 'string|max:50|in:Confirmed,Pending,Cancelled',
                    'notes' => 'nullable|string',
                ]);

                $transport = new \App\Models\Transportation();
                $transport->transport_type = $request->transport_type;
                $transport->departure_date = $request->departure_date;
                $transport->arrival_date = $request->arrival_date;
                $transport->pickup_location = $request->pickup_location;
                $transport->dropoff_location = $request->dropoff_location;
                $transport->passenger_count = $request->passenger_count;
                $transport->status = $request->status ?? 'Pending';
                $transport->notes = $request->notes;
                $transport->save();
                $reservable = $transport;
                break;
            case 'Visa':
                $request->validate([
                    'country' => 'required|string|max:255',
                    'visa_type' => 'required|string|max:50',
                    'application_date' => 'required|date',
                    'duration' => 'required|integer|min:1',
                    'status' => 'sometimes|string|max:50|in:Approved,Pending,Rejected',
                    'notes' => 'required|string',
                ]);

                $visa = new \App\Models\Visa();
                $visa->country = $request->country;
                $visa->visa_type = $request->visa_type;
                $visa->application_date = $request->application_date;
                $visa->duration = $request->duration;
                $visa->status = $request->status ?? 'Pending';
                $visa->notes = $request->notes;
                $visa->save();
                $reservable = $visa;
                break;
            case 'Insurance':
                $request->validate([
                    'insurance_type' => 'required|string|max:50',
                    'provider' => 'required|string|max:255',
                    'start_date' => 'required|date',
                    'end_date' => 'required|date|after_or_equal:start_date',
                    'coverage_details' => 'required|string',
                    'status' => 'string|max:50|in:Active,Expired,Cancelled',
                    'notes' => 'nullable|string'
                ]);
                $insurance = new \App\Models\Insurance();
                $insurance->insurance_type = $request->insurance_type;
                $insurance->provider = $request->provider;
                $insurance->start_date = $request->start_date;
                $insurance->end_date = $request->end_date;
                $insurance->coverage_details = $request->coverage_details;
                $insurance->status = $request->status ?? 'Active';
                $insurance->notes = $request->notes;
                $insurance->save();
                $reservable = $insurance;
                break;
            case 'Ticket':
                $request->validate([
                    'event_name' => 'required|string|max:255',
                    'event_date' => 'required|date',
                    'status' => 'string|max:50|in:Confirmed,Pending,Cancelled',
                    'tickets_count' => 'required|integer|min:1',
                    'seat_category' => 'required|string|max:50',
                    'notes' => 'nullable|string',
                ]);
                $tickets = new \App\Models\Ticket();
                $tickets->event_name = $request->event_name;
                $tickets->event_date = $request->event_date;
                // $tickets->status = $request->status;
                $tickets->status = 'Pending';
                $tickets->tickets_count = $request->tickets_count;
                $tickets->seat_category = $request->seat_category;
                $tickets->notes = $request->notes;
                $tickets->save();
                $reservable = $tickets;
                break;
            case 'Appointment':
                $request->validate([
                    'appointment_type' => 'required|string|max:50',
                    'appointment_date' => 'required|date',
                    'status' => 'string|max:50|in:Completed,Scheduled,Cancelled',
                    'location' => 'required|string|max:255',
                    'notes' => 'nullable|string',
                ]);
                $appointment = new \App\Models\Appointment();
                $appointment->appointment_type = $request->appointment_type;
                $appointment->appointment_date = $request->appointment_date;
                $appointment->status = $request->status ?? 'Scheduled';
                $appointment->location = $request->location;
                $appointment->notes = $request->notes;
                $appointment->save();
                $reservable = $appointment;
                break;
            default:
                return response()->json(['error' => 'Invalid type'], 400);
        }

        if (in_array($type, ['Flight', 'Hotel', 'Cruise', 'Ticket', 'Transportation'])) {
            $request->validate([
                'supplierName' => 'required|string|max:255',
                'supplier_phone' => 'string|max:20',
                'payment_status' => 'sometimes|string|in:Paid,Unpaid,Partial',
            ]);
            $supplier = new \App\Models\Supplier();
            $supplier->name = $request->supplierName;
            $supplier->phone = $request->supplier_phone??'012000000012';
            $supplier->payment_status = $request->payment_status ?? 'Unpaid';
            $supplier->save();
        }

        $request->validate([
            // 'reservable_type' => 'required|string|max:50',
            'status' => 'string|in:Hold,Issued,Cancelled',
            'notes' => 'nullable|string',
            'details.sell_price' => 'required|numeric',
            'details.cost' => 'required|numeric',
            'details.fees' => 'nullable|numeric',
            'net_profit' => 'nullable|numeric',
        ]);
        $reservation = new Reservation();
        $reservation->user_id = auth()->id(); // Assuming you have authentication set up
        $reservation->customer_id = $customer->id;
        $reservation->reservable_id = $reservable->id;
        $reservation->reservable_type = get_class($reservable);
        // $reservation->status = $request->status;
        $reservation->status = 'Hold';
        $reservation->sell_price = $request->details['sell_price'];
        $reservation->cost = $request->details['cost'];
        $reservation->fees = $request->details['fees'] ?? 0;
        $reservation->net_profit = $request->net_profit ?? ($reservation->sell_price - $reservation->cost - $reservation->fees);
        $reservation->notes = $request->notes;
        $reservation->save();

        $reservation = $reservation->with('customer','reservable')->where('id',$reservation->id)->first();
        if ($reservation) {
            return response()->json(['message' => 'Reservation created successfully', 'reservation' => $reservation], 201);
        } else {
            return response()->json(['error' => 'Failed to create reservation'], 500);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $reservation = Reservation::findOrFail($id);

        $reservation->with('customer', 'reservable');
        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }
        return response()->json($reservation, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, $id)
    {
        $reservation = Reservation::with('customer', 'reservable')->findOrFail($id);

        // Update customer (same as store)
        $request->validate([
            'customerName'  => 'sometimes|string|max:255',
            'phoneNumber' => 'sometimes|string|max:20',
        ]);
        $reservation->customer->update([
            'name'  => $request->customerName ?? $reservation->customer->name,
            'phone' => $request->phoneNumber ?? $reservation->customer->phone,
        ]);

        // Determine type from request or by using class basename of reservable type
        $type = $request->type ?? class_basename($reservation->reservable_type);

        switch ($type) {
            case 'Flight':
                // Only update the attributes that exist in the store method for Flight
                $request->validate([
                    'flight_number'  => 'sometimes|string|max:50',
                    'departure_date' => 'sometimes|date',
                    'arrival_date'   => 'sometimes|date',
                    'from_airport'   => 'sometimes|string|max:50',
                    'to_airport'     => 'sometimes|string|max:50',
                    'airline'        => 'sometimes|string|max:50',
                    'notes'          => 'sometimes|string',
                ]);
                $flight = $reservation->reservable;
                $flight->flight_number  = $request->flight_number ?? $flight->flight_number;
                $flight->departure_date = $request->departure_date ?? $flight->departure_date;
                $flight->arrival_date   = $request->arrival_date ?? $flight->arrival_date;
                $flight->from_airport   = $request->from_airport ?? $flight->from_airport;
                $flight->to_airport     = $request->to_airport ?? $flight->to_airport;
                $flight->airline        = $request->airline ?? $flight->airline;
                // Do not update status as it is set to 'Pending' in the store function
                $flight->notes = $request->notes ?? $flight->notes;
                $flight->save();
                break;

            case 'Hotel':
                $request->validate([
                    'hotel_name'     => 'sometimes|string|max:255',
                    'booking_number' => 'sometimes|string|max:50',
                    'check_in_date'  => 'sometimes|date',
                    'check_out_date' => 'sometimes|date|after:check_in_date',
                    'number_of_guests' => 'sometimes|integer|min:1',
                    'number_of_rooms'  => 'sometimes|integer|min:1',
                    'room_type'        => 'sometimes|string|max:50',
                    'notes'            => 'nullable|string',
                ]);
                $hotel = $reservation->reservable;
                $hotel->name           = $request->hotel_name ?? $hotel->name;
                $hotel->booking_number = $request->booking_number ?? $hotel->booking_number;
                $hotel->check_in_date  = $request->check_in_date ?? $hotel->check_in_date;
                $hotel->check_out_date = $request->check_out_date ?? $hotel->check_out_date;
                $hotel->number_of_guests = $request->number_of_guests ?? $hotel->number_of_guests;
                $hotel->number_of_rooms  = $request->number_of_rooms ?? $hotel->number_of_rooms;
                $hotel->room_type      = $request->room_type ?? $hotel->room_type;
                $hotel->notes          = $request->notes ?? $hotel->notes;
                $hotel->save();
                break;

            case 'Cruise':
                $request->validate([
                    'cruise_name'    => 'sometimes|string|max:255',
                    'ship_name'      => 'sometimes|string|max:255',
                    'cabin_type'     => 'sometimes|string|max:50',
                    'departure_date' => 'sometimes|date',
                    'arrival_date'   => 'sometimes|date',
                    'departure_port' => 'sometimes|string|max:255',
                    'arrival_port'   => 'sometimes|string|max:255',
                    'cruise_line'    => 'sometimes|string|max:255',
                    'notes'          => 'nullable|string',
                ]);
                $cruise = $reservation->reservable;
                $cruise->cruise_name    = $request->cruise_name ?? $cruise->cruise_name;
                $cruise->ship_name      = $request->ship_name ?? $cruise->ship_name;
                $cruise->cabin_type     = $request->cabin_type ?? $cruise->cabin_type;
                $cruise->departure_date = $request->departure_date ?? $cruise->departure_date;
                $cruise->arrival_date   = $request->arrival_date ?? $cruise->arrival_date;
                $cruise->departure_port = $request->departure_port ?? $cruise->departure_port;
                $cruise->arrival_port   = $request->arrival_port ?? $cruise->arrival_port;
                $cruise->cruise_line    = $request->cruise_line ?? $cruise->cruise_line;
                $cruise->notes          = $request->notes ?? $cruise->notes;
                $cruise->save();
                break;

            case 'Transportation':
                $request->validate([
                    'transport_type'  => 'sometimes|string|max:50',
                    'departure_date'  => 'sometimes|date',
                    'arrival_date'    => 'sometimes|date',
                    'pickup_location' => 'sometimes|string|max:255',
                    'dropoff_location'=> 'sometimes|string|max:255',
                    'passenger_count' => 'sometimes|integer|min:1',
                    'notes'           => 'nullable|string',
                ]);
                $transport = $reservation->reservable;
                $transport->transport_type  = $request->transport_type ?? $transport->transport_type;
                $transport->departure_date  = $request->departure_date ?? $transport->departure_date;
                $transport->arrival_date    = $request->arrival_date ?? $transport->arrival_date;
                $transport->pickup_location = $request->pickup_location ?? $transport->pickup_location;
                $transport->dropoff_location= $request->dropoff_location ?? $transport->dropoff_location;
                $transport->passenger_count = $request->passenger_count ?? $transport->passenger_count;
                $transport->notes           = $request->notes ?? $transport->notes;
                $transport->save();
                break;

            case 'Visa':
                $request->validate([
                    'country'          => 'sometimes|string|max:255',
                    'visa_type'        => 'sometimes|string|max:50',
                    'application_date' => 'sometimes|date',
                    'duration'         => 'sometimes|integer|min:1',
                    'notes'            => 'sometimes|string',
                ]);
                $visa = $reservation->reservable;
                $visa->country          = $request->country ?? $visa->country;
                $visa->visa_type        = $request->visa_type ?? $visa->visa_type;
                $visa->application_date = $request->application_date ?? $visa->application_date;
                $visa->duration         = $request->duration ?? $visa->duration;
                $visa->notes            = $request->notes ?? $visa->notes;
                $visa->save();
                break;

            case 'Insurance':
                $request->validate([
                    'insurance_type'  => 'sometimes|string|max:50',
                    'provider'        => 'sometimes|string|max:255',
                    'start_date'      => 'sometimes|date',
                    'end_date'        => 'sometimes|date|after_or_equal:start_date',
                    'coverage_details'=> 'sometimes|string',
                    'notes'           => 'nullable|string',
                ]);
                $insurance = $reservation->reservable;
                $insurance->insurance_type  = $request->insurance_type ?? $insurance->insurance_type;
                $insurance->provider        = $request->provider ?? $insurance->provider;
                $insurance->start_date      = $request->start_date ?? $insurance->start_date;
                $insurance->end_date        = $request->end_date ?? $insurance->end_date;
                $insurance->coverage_details= $request->coverage_details ?? $insurance->coverage_details;
                $insurance->notes           = $request->notes ?? $insurance->notes;
                $insurance->save();
                break;

            case 'Ticket':
                // Only update the attributes that are defined in the store function
                $request->validate([
                    'event_name'    => 'sometimes|string|max:255',
                    'event_date'    => 'sometimes|date',
                    'tickets_count' => 'sometimes|integer|min:1',
                    'seat_category' => 'sometimes|string|max:50',
                    'notes'         => 'nullable|string',
                ]);
                $ticket = $reservation->reservable;
                $ticket->event_name    = $request->event_name ?? $ticket->event_name;
                $ticket->event_date    = $request->event_date ?? $ticket->event_date;
                $ticket->tickets_count = $request->tickets_count ?? $ticket->tickets_count;
                $ticket->seat_category = $request->seat_category ?? $ticket->seat_category;
                $ticket->notes         = $request->notes ?? $ticket->notes;
                $ticket->save();
                break;

            case 'Appointment':
                $request->validate([
                    'appointment_type' => 'sometimes|string|max:50',
                    'appointment_date' => 'sometimes|date',
                    'location'         => 'sometimes|string|max:255',
                    'notes'            => 'nullable|string',
                ]);
                $appointment = $reservation->reservable;
                $appointment->appointment_type = $request->appointment_type ?? $appointment->appointment_type;
                $appointment->appointment_date = $request->appointment_date ?? $appointment->appointment_date;
                $appointment->location         = $request->location ?? $appointment->location;
                $appointment->notes            = $request->notes ?? $appointment->notes;
                $appointment->save();
                break;

            default:
                return response()->json(['error' => 'Invalid type'], 400);
        }

        // Update supplier only for specific types as in store method
        if (in_array($type, ['Flight', 'Hotel', 'Cruise', 'Ticket', 'Transportation'])) {
            $request->validate([
                'supplier_name'  => 'sometimes|string|max:255',
                'supplier_phone' => 'sometimes|string|max:20',
                'payment_status' => 'sometimes|string|in:Paid,Unpaid,Partial',
            ]);
            $supplier = \App\Models\Supplier::where('reservable_id', $reservation->reservable->id)->first();
            if ($supplier) {
                $supplier->name           = $request->supplier_name ?? $supplier->name;
                $supplier->phone          = $request->supplier_phone ?? $supplier->phone;
                $supplier->payment_status = $request->payment_status ?? $supplier->payment_status;
                $supplier->save();
            }
        }

        // Update reservation values (only those attributes that exist in store)
        $request->validate([
            'sell_price' => 'sometimes|numeric',
            'cost'       => 'sometimes|numeric',
            'fees'       => 'nullable|numeric',
            'net_profit' => 'nullable|numeric',
            'notes'      => 'nullable|string',
        ]);
        $reservation->update([
            'sell_price' => $request->sell_price ?? $reservation->sell_price,
            'cost'       => $request->cost ?? $reservation->cost,
            'fees'       => $request->fees ?? $reservation->fees,
            'net_profit' => $request->net_profit ?? (
                ($request->sell_price ?? $reservation->sell_price) -
                ($request->cost ?? $reservation->cost) -
                ($request->fees ?? $reservation->fees)
            ),
            'notes'      => $request->notes ?? $reservation->notes,
        ]);

        $updatedReservation = Reservation::with('customer', 'reservable')->find($reservation->id);
        return response()->json(['message' => 'Reservation updated successfully', 'reservation' => $updatedReservation], 200);
    }

    // public function update(Request $request, $id)
    // {
    //     $reservation = Reservation::findOrFail($id);
    //     // return $request;
    //     $request->validate( [
    //         'status' => 'string|in:Hold,Issued,Cancelled',
    //         'notes' => 'nullable|string',
    //         'sell_price' => 'numeric',
    //         'cost' => 'numeric',
    //         'fees' => 'nullable|numeric',
    //         'net_profit' => 'nullable|numeric',
    //     ]);
    //     $reservation->update([
    //         'status' => $request->status ?? $reservation->status,
    //         'sell_price' => $request->sell_price ?? $reservation->sell_price,
    //         'cost' => $request->cost ?? $reservation->cost,
    //         'fees' => $request->fees ?? $reservation->fees,
    //         'net_profit' => $request->net_profit ?? ($reservation->sell_price - $reservation->cost - $reservation->fees),
    //         'notes' => $request->notes ?? $reservation->notes,
    //         'updated_at' => now(),
    //     ]);
    //     if (!$reservation) {
    //         return response()->json(['error' => 'Failed to update reservation'], 500);
    //     }
    //     return response()->json(['message' => 'Reservation updated successfully', 'reservation' => $reservation], 200);
    //     // if ($reservation->status === $request->status) {
    //     //     return response()->json(['message' => 'Reservation updated successfully', 'reservation' => $reservation], 200);
    //     // } else {
    //     //     return response()->json(['error' => 'Failed to update reservation'], 500);
    //     // }

    // }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $reservation = Reservation::findOrFail($id);

        $reservation->load('customer', 'reservable');

        // Delete the related reservable if it exists
        if ($reservation->reservable) {
            $reservation->reservable->delete();
        }

        // Delete the associated customer if needed (ensure this is intended, as a customer may have multiple reservations)
        if ($reservation->customer) {
            $reservation->customer->delete();
        }

        $deleted = $reservation->delete();
        if (!$deleted) {
            return response()->json(['error' => 'Failed to delete reservation'], 500);
        }
        return response()->json(['message' => 'Reservation soft deleted successfully'], 200);
    }
}
