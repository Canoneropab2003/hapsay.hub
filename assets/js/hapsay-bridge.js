/**
 * HapsayHub Data Bridge
 * Handles synchronization between Organizer and Superadmin using LocalStorage
 */

const HH_Bridge = {
    DB_KEY: 'hh_global_events',

    // 1. SAVE/UPDATE DATA
    saveToHub: function(eventData) {
        let events = this.getAllEvents();
        const index = events.findIndex(e => e.id === eventData.id);

        if (index !== -1) {
            events[index] = eventData; // Update existing
        } else {
            events.push(eventData); // Add new
        }

        localStorage.setItem(this.DB_KEY, JSON.stringify(events));
        this.notifySync();
    },

    // 2. GET ALL DATA
    getAllEvents: function() {
        const data = localStorage.getItem(this.DB_KEY);
        return data ? JSON.parse(data) : [];
    },

    // 3. DELETE DATA
    deleteFromHub: function(id) {
        let events = this.getAllEvents();
        events = events.filter(e => e.id !== id);
        localStorage.setItem(this.DB_KEY, JSON.stringify(events));
        this.notifySync();
    },

    // 4. CROSS-TAB NOTIFICATION
    // This allows the Superadmin page to update instantly if the Organizer adds something
    notifySync: function() {
        window.dispatchEvent(new Event('storage'));
    }
};