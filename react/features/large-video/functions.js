let _selectedParticipants = [];

export function getSelectedParticipants() {
    return _selectedParticipants;
}

export function setSelectedParticipants(ids) {
    _selectedParticipants = [ ...ids ];
}

export function findSelectedParticipant(id) {
    return _selectedParticipants.includes(id);
}
