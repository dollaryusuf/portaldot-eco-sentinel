#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod green_cert {
    use ink::storage::Mapping;

    #[derive(scale::Decode, scale::Encode, Debug, PartialEq, Eq, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Attestation {
        pub efficiency_score: u16,
        pub block_height: u32,
        pub audit_timestamp: Timestamp,
    }

    #[ink(storage)]
    pub struct GreenCert {
        /// The Sentinel account who has minting rights
        sentinel: AccountId,
        /// Mapping from AccountId to their Sustainability Attestation
        attestations: Mapping<AccountId, Attestation>,
        /// Record of total certificates issued
        total_supply: u64,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotSentinel,
        AlreadyHasCert,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    /// Event emitted when a new Green Certificate is minted
    #[ink(event)]
    pub struct CertificateMinted {
        #[ink(topic)]
        target: AccountId,
        efficiency_score: u16,
        audit_timestamp: Timestamp,
    }

    impl GreenCert {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                sentinel: Self::env().caller(),
                attestations: Mapping::default(),
                total_supply: 0,
            }
        }

        /// Mint a new Soulbound Sustainability Attestation
        /// Only the Sentinel account can call this function.
        #[ink(message)]
        pub fn mint_attestation(
            &mut self,
            target: AccountId,
            efficiency_score: u16,
            block_height: u32,
        ) -> Result<()> {
            // Access Control: Only sentinel
            if self.env().caller() != self.sentinel {
                return Err(Error::NotSentinel);
            }

            // Ensure Soulbound property: One cert per account for this demo
            if self.attestations.contains(target) {
                return Err(Error.AlreadyHasCert);
            }

            let attestation = Attestation {
                efficiency_score,
                block_height,
                audit_timestamp: self.env().block_timestamp(),
            };

            self.attestations.insert(target, &attestation);
            self.total_supply += 1;

            self.env().emit_event(CertificateMinted {
                target,
                efficiency_score,
                audit_timestamp: attestation.audit_timestamp,
            });

            Ok(())
        }

        /// Returns the Sustainability Index (efficiency score) for a validator
        #[ink(message)]
        pub fn get_sustainability_index(&self, target: AccountId) -> Option<u16> {
            self.attestations.get(target).map(|a| a.efficiency_score)
        }

        /// Returns the full attestation metadata
        #[ink(message)]
        pub fn get_attestation(&self, target: AccountId) -> Option<Attestation> {
            self.attestations.get(target)
        }

        /// Returns the sentinel address
        #[ink(message)]
        pub fn get_sentinel(&self) -> AccountId {
            self.sentinel
        }

        /// Transfer restricted: This is a Soulbound token contract.
        /// No public transfer function exists, enforcing non-transferability.
        #[ink(message)]
        pub fn total_issued(&self) -> u64 {
            self.total_supply
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn mint_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = GreenCert::new();
            
            assert_eq!(contract.get_sentinel(), accounts.alice);
            
            assert!(contract.mint_attestation(accounts.bob, 9500, 104237).is_ok());
            assert_eq!(contract.get_sustainability_index(accounts.bob), Some(9500));
        }

        #[ink::test]
        fn non_admin_mint_fails() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let mut contract = GreenCert::new();
            
            // Switch caller to Bob
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            
            assert_eq!(contract.mint_attestation(accounts.charlie, 9000, 104238), Err(Error::NotSentinel));
        }
    }
}
