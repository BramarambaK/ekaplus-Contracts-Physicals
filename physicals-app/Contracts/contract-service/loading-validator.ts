import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export function loadingValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      return control.value === 'loading' ? {'loading': {value: control.value}} : null;
    };
}

export function toleranceMaxValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const itemQty = control.get('itemQty');
    const toleranceType = control.get('toleranceType');
    const toleranceMax = control.get('toleranceMax');
    return itemQty && toleranceType && toleranceMax && itemQty.value && toleranceType.value === 'Absolute' && toleranceMax.value < itemQty.value ? { maxToleranceLessThanItemQty: true } : null;
  };
}

export const allOrNoneRequiredValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  const keys: string[] = Object.keys(group.controls);
  const valid: boolean = keys.every((key: string): boolean => !!group.controls[key].value) ||
    keys.every((key: string): boolean => !group.controls[key].value);
  return valid ? null : { allOrNoneRequired: true };
};