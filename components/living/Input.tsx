import React from 'react'
import { InputField, InputFieldProps } from './InputField'

export interface InputProps extends InputFieldProps {}

/**
 * Re-exportación unificada de InputField para compatibilidad total con código existente
 */
export const Input = InputField
export default Input
