/**
 * HapsayHub (HH) Dashboard - Payments & Pricing Logic
 */

// 1. Populate the Payments Dropdown with ALL events
HH_Dashboard.refreshPaymentFilter = function() {
    const dropdown = document.getElementById('paymentEventSelector');
    if (!dropdown || typeof HH_Bridge === 'undefined') return;

    const allEvents = HH_Bridge.getAllEvents(); // Fetches from hh_events
    const currentValue = dropdown.value;

    // Reset dropdown and add default
    dropdown.innerHTML = '<option value="all">All HapsayHub Events</option>';

    // Add every event found in the system
    allEvents.forEach(ev => {
        const option = document.createElement('option');
        option.value = ev.id;
        option.textContent = ev.name;
        dropdown.appendChild(option);
    });

    // Keep the selection if it was already chosen
    dropdown.value = currentValue || 'all';
};

// 2. Load Stats and Calculate Revenue for the selected event
HH_Dashboard.loadPaymentStats = function(eventId) {
    const allAttendees = HH_Bridge.getAllAttendees(); // Fetches from hh_attendees
    const vipFee = parseFloat(document.getElementById('vipFeeInput').value) || 0;
    
    // Filter logic: Find VIPs belonging to the selected event
    const vips = allAttendees.filter(att => {
        const matchEvent = (eventId === 'all' || att.eventId == eventId);
        // Matches "VIP" or "VIP Pass" registration types
        const isVIP = (att.ticketType === 'VIP' || att.ticketType === 'VIP Pass');
        // Only count those who haven't paid or checked-in yet
        const isPending = (att.status !== 'Paid' && att.status !== 'Checked-in');
        
        return matchEvent && isVIP && isPending;
    });

    const totalRevenue = vips.length * vipFee;

    // Update the Dark Card UI with PHP formatting
    const displayElement = document.getElementById('totalPendingRevenue');
    if (displayElement) {
        displayElement.innerText = `P ${totalRevenue.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
};

// 3. Helper to recalculate revenue if you manually change the fee input
HH_Dashboard.calculateRevenue = function() {
    const selectedEventId = document.getElementById('paymentEventSelector').value;
    this.loadPaymentStats(selectedEventId);
};