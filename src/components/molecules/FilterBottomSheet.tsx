// import React, { useState, useMemo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from 'react-native';
// import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
// import { colors } from '../../styles/colors';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// // Import checkbox and section components
// interface CheckboxItemProps {
//   label: string;
//   checked: boolean;
//   onPress: () => void;
// }

// const CheckboxItem: React.FC<CheckboxItemProps> = ({
//   label,
//   checked,
//   onPress,
// }) => {
//   return (
//     <TouchableOpacity
//       style={styles.checkboxContainer}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
//         {checked && <Text style={styles.checkmark}>✓</Text>}
//       </View>
//       <Text style={styles.checkboxLabel}>{label}</Text>
//     </TouchableOpacity>
//   );
// };

// interface FilterSectionProps {
//   title: string;
//   children: React.ReactNode;
//   defaultExpanded?: boolean;
// }

// const FilterSection: React.FC<FilterSectionProps> = ({
//   title,
//   children,
//   defaultExpanded = true,
// }) => {
//   const [isExpanded, setIsExpanded] = useState(defaultExpanded);

//   return (
//     <View style={styles.section}>
//       <TouchableOpacity
//         style={styles.sectionHeader}
//         onPress={() => setIsExpanded(!isExpanded)}
//         activeOpacity={0.7}
//       >
//         <Text style={styles.sectionTitle}>{title}</Text>
//         <Ionicons
//           name={isExpanded ? 'chevron-up' : 'chevron-down'}
//           size={20}
//           color="#666"
//         />
//       </TouchableOpacity>
//       {isExpanded && <View style={styles.sectionContent}>{children}</View>}
//     </View>
//   );
// };

// interface FilterBottomSheetProps {
//   bottomSheetRef: React.RefObject<BottomSheet>;
//   onApplyFilters: (filters: FilterState) => void;
// }

// interface FilterState {
//   clinicTypes: { [key: string]: boolean };
//   serviceGroups: { [key: string]: boolean };
//   serviceNames: { [key: string]: boolean };
// }

// export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
//   bottomSheetRef,
//   onApplyFilters,
// }) => {
//   const snapPoints = useMemo(() => ['25%', '85%'], []);

//   const [filters, setFilters] = useState<FilterState>({
//     clinicTypes: {
//       Dentistry: false,
//       Dermatology: false,
//     },
//     serviceGroups: {
//       Diagnostics: false,
//       'Oral Surgery': false,
//       Prosthodontics: false,
//       Periodontics: false,
//       Restorative: false,
//       Pedodontics: false,
//       Implant: false,
//     },
//     serviceNames: {
//       'Oral Examination': false,
//       'Oral Exam - Home Visit': false,
//     },
//   });

//   // Calculate selected filters count
//   const selectedFiltersCount = useMemo(() => {
//     let count = 0;
//     count += Object.values(filters.clinicTypes).filter(Boolean).length;
//     count += Object.values(filters.serviceGroups).filter(Boolean).length;
//     count += Object.values(filters.serviceNames).filter(Boolean).length;
//     return count;
//   }, [filters]);

//   const handleClinicTypeToggle = (type: string) => {
//     setFilters({
//       ...filters,
//       clinicTypes: {
//         ...filters.clinicTypes,
//         [type]: !filters.clinicTypes[type],
//       },
//     });
//   };

//   const handleServiceGroupToggle = (service: string) => {
//     setFilters({
//       ...filters,
//       serviceGroups: {
//         ...filters.serviceGroups,
//         [service]: !filters.serviceGroups[service],
//       },
//     });
//   };

//   const handleServiceNameToggle = (service: string) => {
//     setFilters({
//       ...filters,
//       serviceNames: {
//         ...filters.serviceNames,
//         [service]: !filters.serviceNames[service],
//       },
//     });
//   };

//   const handleReset = () => {
//     setFilters({
//       clinicTypes: {
//         Dentistry: false,
//         Dermatology: false,
//       },
//       serviceGroups: {
//         Diagnostics: false,
//         'Oral Surgery': false,
//         Prosthodontics: false,
//         Periodontics: false,
//         Restorative: false,
//         Pedodontics: false,
//         Implant: false,
//       },
//       serviceNames: {
//         'Oral Examination': false,
//         'Oral Exam - Home Visit': false,
//       },
//     });
//   };

//   const handleApply = () => {
//     onApplyFilters(filters);
//     bottomSheetRef.current?.close();
//   };

//   const handleClose = () => {
//     bottomSheetRef.current?.close();
//   };

//   const renderBackdrop = useCallback(
//     (props: any) => (
//       <BottomSheetBackdrop
//         {...props}
//         disappearsOnIndex={-1}
//         appearsOnIndex={0}
//         opacity={0.5}
//       />
//     ),
//     [],
//   );

//   return (
//     <BottomSheet
//       ref={bottomSheetRef}
//       index={-1}
//       snapPoints={snapPoints}
//       enablePanDownToClose
//       backdropComponent={renderBackdrop}
//       backgroundStyle={styles.bottomSheetBackground}
//       handleIndicatorStyle={styles.handleIndicator}
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>
//             Filters ({selectedFiltersCount})
//           </Text>
//           <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//             <Ionicons name="close" size={24} color={colors.text} />
//           </TouchableOpacity>
//         </View>

//         {/* Content */}
//         <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//           {/* Clinic Type */}
//           <FilterSection title="Clinic Type">
//             <CheckboxItem
//               label="Dentistry"
//               checked={filters.clinicTypes.Dentistry}
//               onPress={() => handleClinicTypeToggle('Dentistry')}
//             />
//             <CheckboxItem
//               label="Dermatology"
//               checked={filters.clinicTypes.Dermatology}
//               onPress={() => handleClinicTypeToggle('Dermatology')}
//             />
//           </FilterSection>

//           {/* Service Group */}
//           <FilterSection title="Service Group">
//             {Object.keys(filters.serviceGroups).map(service => (
//               <CheckboxItem
//                 key={service}
//                 label={service}
//                 checked={filters.serviceGroups[service]}
//                 onPress={() => handleServiceGroupToggle(service)}
//               />
//             ))}
//           </FilterSection>

//           {/* Service Name */}
//           <FilterSection title="Service Name">
//             {Object.keys(filters.serviceNames).map(service => (
//               <CheckboxItem
//                 key={service}
//                 label={service}
//                 checked={filters.serviceNames[service]}
//                 onPress={() => handleServiceNameToggle(service)}
//               />
//             ))}
//           </FilterSection>
//         </ScrollView>

//         {/* Footer Buttons */}
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={styles.resetButton}
//             onPress={handleReset}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.resetText}>Reset</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.applyButton}
//             onPress={handleApply}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.applyText}>Apply Filter</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </BottomSheet>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   bottomSheetBackground: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//   },
//   handleIndicator: {
//     backgroundColor: '#E0E0E0',
//     width: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.text,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//   },
//   section: {
//     marginBottom: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//   },
//   sectionContent: {
//     paddingTop: 8,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 2,
//     borderColor: '#DDD',
//     marginRight: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkboxChecked: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   checkmark: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   checkboxLabel: {
//     fontSize: 15,
//     color: '#1A1A1A',
//   },
//   footer: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     gap: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   resetButton: {
//     flex: 1,
//     height: 48,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: colors.border,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   resetText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   applyButton: {
//     flex: 1,
//     height: 48,
//     borderRadius: 12,
//     backgroundColor: colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   applyText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
// });

// export default FilterBottomSheet;
