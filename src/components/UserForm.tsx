import { Ref, forwardRef, useImperativeHandle, useState } from "react"

export interface FormOption {
  label: string
  value: any
}

export interface FormItem {
  label: string
  type: 'input' | 'textarea' | 'select' | 'number'
  value: string
  placeholder?: string
  required?: boolean
  options?: FormOption[]
}

interface UserFormProps {
  forms: FormItem[]
}

export interface UserFormHandle {
  getValues: () => Record<string, any>
  resetForm: () => void
  setDefaultValue: (row: Record<string, any>) => void
}

function getRenderControl(form: FormItem, updateFormValue: (key: string, value: any) => void, defaultValue: Record<string, any>) {
  if (form.type === 'input') {
    return <input type="text" value={defaultValue[form.value] || ""} onChange={(e) => updateFormValue(form.value, e.target.value)} className="w-full px-1 border border-gray-300 rounded-sm" placeholder={form.placeholder} />
  } else if (form.type === 'textarea') {
    return <textarea value={defaultValue[form.value] || ""} onChange={(e) => updateFormValue(form.value, e.target.value)} className="w-full px-1 border border-gray-300 rounded-sm" placeholder={form.placeholder} />
  } else if (form.type === 'select') {
    return <select value={defaultValue[form.value] || ""} onChange={(e) => updateFormValue(form.value, e.target.value)} className="w-full px-1 border border-gray-300 rounded-sm">
      {form.options?.map((option, index) => {
        return <option key={index} value={option.value}>{option.label}</option>
      })}
    </select>
  } else if (form.type === 'number') {
    return <input value={defaultValue[form.value] || 0} onChange={(e) => updateFormValue(form.value, e.target.value)} type="number" className="w-full px-1 border border-gray-300 rounded-sm" placeholder={form.placeholder} />
  }
}

function UserForm(props: UserFormProps, ref: Ref<UserFormHandle>) {
  const [formValue, setFormValue] = useState<Record<string, any>>({})
  useImperativeHandle(ref, () => {
    return {
      getValues() {
        return {
          ...formValue
        }
      },
      resetForm() {

      },
      setDefaultValue(row: Record<string, any>) {
        setFormValue({
          ...row
        })
      }
    }
  })

  function updateFormValue(key: string, value: any) {
    setFormValue(prev => {
      return {
        ...prev,
        [key]: value
      }
    })
  }

  return <div className="w-full h-full px-3 pb-5">
    {props.forms.map((form, index) => {
      return <div key={index} className="flex flex-row w-full px-3 mt-4">
        <div className="flex items-center justify-end w-1/3 pr-2 text-right text-gray-600">{form.label}：</div>
        <div className="flex-grow w-2/3">
          {getRenderControl(form, updateFormValue, formValue)}
        </div>
      </div>
    })}
  </div>
}

export default forwardRef<UserFormHandle, UserFormProps>(UserForm)