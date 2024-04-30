const addresses = {
    props:
        {},
    data() {
        return {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            newAddress: "",
            newAddress1: "",
            editedAddress: "",
            user: null,
        }
    },
    mounted() {
        this.retail_user();
    },
    methods: {
        retail_user() {
            this._getRetailUserProfile(e => {
                this.user = e.user;
            });

        },
        startEditing(address) {
            address.isEditing = true;
            this.editedAddress = {
                firstName: address.firstName,
                lastName: address.lastName,
                phoneNumber: address.phoneNumber,
                address1: address.address1,
                address2: address.address2,
                city: address.city,
                country: address.country,
                postalCode: address.postalCode,
                state: address.state
            };
            const editModal = new bootstrap.Modal(document.getElementById('editAddressForm'));
            editModal.show();
        },
        saveEditedAddress() {
            const editedAddress = this.user.addresses.find(address => address.isEditing);
            const index = this.user.addresses.indexOf(editedAddress);

            // Update the address information in the user object
            this.user.addresses[index].firstName = this.editedAddress.firstName;
            this.user.addresses[index].lastName = this.editedAddress.lastName;
            this.user.addresses[index].phoneNumber = this.editedAddress.phoneNumber;
            this.user.addresses[index].address1 = this.editedAddress.address1;
            this.user.addresses[index].address2 = this.editedAddress.address2;
            this.user.addresses[index].city = this.editedAddress.city;
            this.user.addresses[index].country = this.editedAddress.country;
            this.user.addresses[index].postalCode = this.editedAddress.postalCode;
            this.user.addresses[index].state = this.editedAddress.state;

            // Prepare the data to update the user profile
            const addressesToUpdate = {
                Addresses: this.user.addresses.map((addr) => ({
                    firstName: addr.firstName,
                    lastName: addr.lastName,
                    phoneNumber: addr.phoneNumber,
                    address1: addr.address1,
                    address2: addr.address2,
                    city: addr.city,
                    country: addr.country,
                    postalCode: addr.postalCode,
                    state: addr.state
                })),
            };

            // Call the method to update the user profile
            this._updateRetailUserProfile(addressesToUpdate, (updatedAddresses) => {
                this.user.addresses = updatedAddresses.addresses;
                this.editedAddress = '';
            });

            // Reset the isEditing property
            editedAddress.isEditing = false;
        },
        deleteAddress(index) {

            const addressesCopy = {
                Addresses: [...this.user.addresses],
            };
            // Extract the address to be deleted
            const deletedAddress = addressesCopy.Addresses.splice(index, 1)[0];

            this.user.addresses = addressesCopy.Addresses;

            this._updateRetailUserProfile(addressesCopy, updatedAddresses => {
                this.editedAddress = '';

            });


        },

        createNewAddress() {
            if (!this.user.addresses) {
                // Initialize the user addresses with a default structure
                this.user.addresses = [];
            }

            const newAddressObject = {
                firstName: this.firstName,
                lastName: this.lastName,
                phoneNumber: this.phoneNumber,
                address1: this.newAddress,
                address2: this.newAddress1,
                city: this.city,
                country: this.country,
                postalCode: this.postalCode,
                state: this.state
            };
            if (
                this.newAddress === '' &&
                this.firstName === '' &&
                this.lastName === '' &&
                this.phoneNumber === '' &&
                this.newAddress1 === '' &&
                this.city === '' &&
                this.country === '' &&
                this.postalCode === '' &&
                this.state === ''
            ) {
                return;
            }
            this.user.addresses?.push(newAddressObject);

            const addressesToUpdate = {
                addresses: this.user.addresses?.map(addr => ({
                    firstName: addr.firstName,
                    lastName: addr.lastName,
                    phoneNumber: addr.phoneNumber,
                    address1: addr.address1,
                    address2: addr.address2,
                    city: addr.city,
                    country: addr.country,
                    postalCode: addr.postalCode,
                    state: addr.state
                }))
            };


            // Call the _updateRetailUserProfile function with the updated addresses
            this._updateRetailUserProfile(addressesToUpdate, updatedAddresses => {
                this.user.addresses = updatedAddresses.addresses;
            });
            // Reset the form fields
            this.firstName = '';
            this.lastName = '';
            this.phoneNumber = '';
            this.newAddress = '';
            this.newAddress1 = '';
            this.city = '';
            this.country = '';
            this.postalCode = '';
            this.state = '';
        },
    },

}

app.component('addresses', {
    extends: addresses,
    template: '#addresses'
});