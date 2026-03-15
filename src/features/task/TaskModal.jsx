import { Modal } from '../../components/ui/Modal'

export function TaskModal({
  isOpen,
  onClose,
  title = 'Task Details',
  children,
  showCloseButton = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={showCloseButton}>
      {children}
    </Modal>
  )
}
