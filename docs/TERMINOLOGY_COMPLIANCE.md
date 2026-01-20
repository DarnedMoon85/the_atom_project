# Terminology Compliance Report

## Scan Date
2026-01-19

## Scope
Core logic files in `src/logic/` excluding mapping layers and legacy compatibility code.

## Files Scanned
- `src/logic/core/StateMachineInstance.ts`
- `src/logic/core/DataAccessLayer.ts`
- `src/logic/AtomHub.ts`
- `src/logic/types.ts`
- `src/logic/core/SupabaseDataAccess.ts` (mapping layer - exceptions noted)

## Search Terms
- SKU
- Order
- orderId
- itemCode
- LPN
- prefix

## Findings

### Core Logic Files (COMPLIANT)

#### StateMachineInstance.ts
- **Status**: ✅ COMPLIANT
- **Findings**: No WMS-specific terms found
- **Notes**: Uses only industry-agnostic terminology (Unit, Transaction, trackingIdentifier, category, ProtocolState)

#### DataAccessLayer.ts
- **Status**: ✅ COMPLIANT
- **Findings**: One comment reference: "Transaction operations (replaces Order)"
- **Notes**: Comment is acceptable as it documents the refactoring

#### AtomHub.ts
- **Status**: ✅ COMPLIANT
- **Findings**: No WMS-specific terms found
- **Notes**: Fully industry-agnostic implementation

#### types.ts
- **Status**: ✅ COMPLIANT
- **Findings**: 
  - Comments explaining replacements (e.g., "Replaces itemCode", "Replaces Order")
  - Legacy types (Order, Item, SessionItem) kept for backward compatibility
- **Notes**: 
  - Comments are acceptable documentation
  - Legacy types are explicitly marked and kept separate from core types
  - Core types use industry-agnostic terminology

### Mapping Layer (EXCEPTION - ACCEPTABLE)

#### SupabaseDataAccess.ts
- **Status**: ⚠️ EXCEPTION (ACCEPTABLE)
- **Findings**: Uses database column names:
  - `lpn` (maps to `trackingIdentifier`)
  - `order_id` (maps to `transactionId`)
  - `prefix` (maps to `category`)
- **Notes**: 
  - This is a mapping layer between industry-agnostic types and database schema
  - Database column names are legacy and will be migrated in future schema update
  - All public methods use industry-agnostic types
  - Internal mapping is acceptable per Constitution (mapping layers may use legacy terms)

## Compliance Summary

### Core Logic Compliance: ✅ 100%
All core logic files (`StateMachineInstance`, `DataAccessLayer`, `AtomHub`, `types`) use only industry-agnostic terminology:
- ✅ Unit (not Item/SKU)
- ✅ Transaction (not Order)
- ✅ trackingIdentifier (not LPN)
- ✅ category (not prefix)
- ✅ ProtocolState (not CEOState)

### Exceptions (Acceptable)
1. **Comments**: Documentation comments explaining refactoring are acceptable
2. **Legacy Types**: Backward compatibility types kept separate and clearly marked
3. **Mapping Layer**: `SupabaseDataAccess` uses database column names internally (acceptable for mapping layer)

## Conclusion

**STATUS: COMPLIANT**

All core logic adheres to the Atomic Sovereign Constitution requirement for industry-agnostic terminology. The codebase is ready for expansion beyond WMS domains.

## Next Steps
- Database schema migration to align column names with industry-agnostic terminology (future enhancement)
- Consider renaming database columns: `lpn` → `tracking_identifier`, `order_id` → `transaction_id`, `prefix` → `category`
