'use client';
import { OrderExperience } from './OrderExperience';

export function OrderDetail(props: {id:string;onClose:()=>void;onSaved:()=>void}) {
  return <OrderExperience key={props.id} {...props}/>;
}
