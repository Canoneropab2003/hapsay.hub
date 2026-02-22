/**
 * HapsayHub (HH) Unified Bridge
 * This is the ONLY bridge file you need. Link this in all HTML files.
 */
const HH_Bridge = {
    // This MUST match what the Admin/Organizer uses
    DB_KEY: 'hh_global_events', 

    getAllEvents: function() {
        const data = localStorage.getItem(this.DB_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveToHub: function(eventData) {
        let events = this.getAllEvents();
        const index = events.findIndex(e => e.id === eventData.id);

        if (index !== -1) {
            events[index] = eventData;
        } else {
            events.push(eventData);
        }

        localStorage.setItem(this.DB_KEY, JSON.stringify(events));
        this.notifySync();
    },

    deleteFromHub: function(id) {
        let events = this.getAllEvents();
        events = events.filter(e => e.id !== id);
        localStorage.setItem(this.DB_KEY, JSON.stringify(events));
        this.notifySync();
    },

    notifySync: function() {
        // This triggers the 'storage' event so other tabs update instantly
        window.dispatchEvent(new Event('storage'));
    }
};