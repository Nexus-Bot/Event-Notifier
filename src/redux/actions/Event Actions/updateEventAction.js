import { getFirebase } from "react-redux-firebase";
import { toastr } from "react-redux-toastr";
import history from "../../../history";
import { extraActivitiesDelete } from "../../../App/Util/helpers";
import { asyncActionFinish, asyncActionStart, asyncActionError } from "..";

export const updateEvent = (event, eventId) => {
	return async (dispatch) => {
		const firebase = getFirebase();
		const firestore = firebase.firestore();
		const eventDocRef = firestore.collection("events").doc(eventId);
		const eventAttendeeRef = firestore.collection("event_attendee");
		let eventDate = event.date ? event.date : new Date();
		let eventTime = event.time ? event.time : new Date();
		if (typeof eventTime.toDate === "function")
			eventTime = eventTime.toDate();
		if (typeof eventDate.toDate === "function")
			eventDate = eventDate.toDate();

		let completeEventDate = new Date();
		completeEventDate.setDate(eventDate.getDate());
		completeEventDate.setMonth(eventDate.getMonth());
		completeEventDate.setFullYear(eventDate.getFullYear());
		completeEventDate.setHours(
			eventTime.getHours(),
			eventTime.getMinutes(),
			eventTime.getSeconds()
		);

		delete event.date;
		delete event.time;

		try {
			dispatch(asyncActionStart());
			let batch = firestore.batch();

			//updating event in events collection
			batch.update(eventDocRef, {
				date: completeEventDate,
				time: eventTime,
				...event,
			});

			//updating data related to event in event_attendee collection
			let eventQuery = eventAttendeeRef.where("eventId", "==", eventId);
			let eventQuerySnap = await eventQuery.get();

			for (let index = 0; index < eventQuerySnap.docs.length; index++) {
				let eventAttendeeDocRef = eventQuerySnap.docs[index].ref;
				batch.update(eventAttendeeDocRef, {
					eventDate: completeEventDate,
					category: event.category,
				});
			}

			await batch.commit();
			extraActivitiesDelete(firebase);
			dispatch(asyncActionFinish());
			history.push(`/events/${eventId}`);
			toastr.success("Success!!! ", "Event has been updated");
		} catch (error) {
			dispatch(asyncActionError());
			toastr.error(
				"Oops",
				"Something went wrong. Please retry / Check your internet connection"
			);
		}
	};
};
