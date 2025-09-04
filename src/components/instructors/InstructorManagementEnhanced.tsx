// Add these dialogs to the end of InstructorManagement.tsx before the closing </div> and }

      {showCreateDialog && (
        <CreateInstructorDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={(instructorData) => {
            console.log('Creating instructor:', instructorData);
            setShowCreateDialog(false);
          }}
        />
      )}

      {showProfileManagement && selectedInstructor && (
        <InstructorProfileManagement
          instructor={selectedInstructor}
          onEdit={() => {
            setShowProfileManagement(false);
            setShowInstructorDetail(true);
          }}
          onSchedule={() => {
            setShowProfileManagement(false);
            setShowSchedulingManagement(true);
          }}
        />
      )}

      {showSchedulingManagement && selectedInstructor && (
        <InstructorSchedulingManagement
          instructor={selectedInstructor}
          onClose={() => setShowSchedulingManagement(false)}
        />
      )}

      {showPaymentManagement && selectedInstructor && (
        <InstructorPaymentManagement
          instructor={selectedInstructor}
          onClose={() => setShowPaymentManagement(false)}
        />
      )}
    </div>
  );
}