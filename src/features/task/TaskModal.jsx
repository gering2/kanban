import { Modal } from '../../components/ui/Modal'

export function TaskModal({ isOpen, onClose, title = 'Task Details', children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {children}
    </Modal>
  )
}
