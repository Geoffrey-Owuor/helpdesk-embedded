"use client";
import { Dispatch, SetStateAction } from "react";

type TitleDescriptionModalProps = {
  title: string;
  description: string;
  closeModal: Dispatch<SetStateAction<boolean>>;
};
const TitleDescriptionModal = ({
  title,
  description,
}: TitleDescriptionModalProps) => {
  return <div>TitleDescriptionModal</div>;
};

export default TitleDescriptionModal;
