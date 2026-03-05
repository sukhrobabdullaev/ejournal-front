import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import type { Submission, TopicArea } from '../../lib/api';
import {
  createSubmission,
  getSubmissionById,
  updateSubmission,
  uploadSubmissionFile,
  getTopicAreas,
  isAuthenticated,
} from '../../lib/queries-api';
import type { Step, Policies, WizardManuscriptForm } from './types';
import { allPoliciesAccepted } from './helpers';
import { PageHeader, Progress } from './steps/WizardHeader';
import { PoliciesStep } from './steps/PoliciesStep';
import { DetailsStep } from './steps/DetailsStep';
import { FilesStep } from './steps/FilesStep';
import { ReviewStep } from './steps/ReviewStep';
import { SubmittedState } from './steps/SubmittedState';

type SubmitPaperWizardProps = {
  submissionIdFromRoute?: string;
  submissionIdFromQuery?: string | null;
};import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCirctlimport { useNavigate } from 'react-router';
importn import { AlertCircle } from 'lucide-react't.import type { Submission, TopicArea } frombeimport {
  createSubmission,
  getSubmissionById,
  updatere  creatle  getSubmissionByI k  updateSubmission,a.  uploadSubmission8)  getTopicAreas,
  isAwo  isAuthenticat i} from '../../liba)import type { Step, Policies,  aimport { allPoliciesAccepted } from './helpers';
import { PageHeadeisimport { PageHeader, Progress } from './steps/Wbmimport { PoliciesStep } from './steps/PoliciesStep';
importonimport { DetailsStep } from './steps/DetailsStep';
[cimport { FilesStep } from './steps/FilesStep';
im  import { ReviewStep } from './steps/ReviewSteSuimport { SubmittedState } from './steps/Submittr]
type SubmitPaperWizardProps = {
  submissionIdFromRoutavi  submissionIdFromRoute?: stri [  submissionIdFromQuery?: string =};import React, { useEffect, useState }seimport { useNavigate } from 'react-router';
import {poimport { AlertCirctlimport { useNavigate }{
importn import { AlertCircle } from 'lucide-react't.import typse  createSubmission,
  getSubmissionById,
  updatere  creatle  getSubmissionByI k  updateSubmission,a.  or  getSubmissionByI,
  updatere  creatle    isAwo  isAuthenticat i} from '../../liba)import type { Step, Policies,  aimport { allPolicies''import { PageHeadeisimport { PageHeader, Progress } from './steps/Wbmimport { PoliciesStep } from './steps/PoliciesStep';
zeimportonimport { DetailsStep } from './steps/DetailsStep';
[cimport { FilesStep } from './steps/FilesStep';
im  import {  [cimport { FilesStep } from './steps/FilesStep';
im  impo  im  import { ReviewStep } from './steps/ReviewS  type SubmitPaperWizardProps = {
  submissionIdFromRoutavi  submissionIdFromRoute?: stri [  submissi a  submissionIdFromRoutavi  subtTimport {poimport { AlertCirctlimport { useNavigate }{
importn import { AlertCircle } from 'lucide-react't.import typse  createSubmission,
  getSubmissionById,
  updatere  cresoimportn import { AlertCircle } from 'lucide-react't.tE  getSubmissionById,
  updatere  creatle  getSubmissionByI k  updateSubmission,a. (f  updatere  creatle    updatere  creatle    isAwo  isAuthenticat i} from '../../liba)import type { Stepubzeimportonimport { DetailsStep } from './steps/DetailsStep';
[cimport { FilesStep } from './steps/FilesStep';
im  import {  [cimport { FilesStep } from './steps/FilesStep';
im  impo  im  import { ReviewStep } from './steps/ReviewS  type San[cimport { FilesStep } from './steps/FilesStep';
im  importicim  import {  [cimport { FilesStep } from './stpyim  impo  im  import { ReviewStep } from './steps/ReviewS  tye:  submissionIdFromRoutavi  submissionIdFromRoute?: stri [  submissi a  submissionIdFromRo[]importn import { AlertCircle } from 'lucide-react't.import typse  createSubmission,
  getSubmissionById,
  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cresoimportn import { AlertCircle } from 'lucide-    updatere  cresoimre  updatere  creatle  getSubmissionByI k  updateSubmission,a. (f  updatere  creatle    updaet[cimport { FilesStep } from './steps/FilesStep';
im  import {  [cimport { FilesStep } from './steps/FilesStep';
im  impo  im  import { ReviewStep } from './steps/ReviewS  type San[cimport { FilesStep } from './steps/FilesStep';n im  import {  [cimport { FilesStep } from './stipim  impo  im  import { ReviewStep } from './steps/ReviewS  ty

im  importicim  import {  [cimport { FilesStep } from './stpyim  impo  im  import { ReviewStep } from './steps/Revol  getSubmissionById,
  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cresoimportn import { AlertCircle } from 'lucide-    updatere  cresoimre  updatere  creatle  getSubmissionByI k  updateSubmission,a. (f  updatere  creatle    updaet[cimport { FilesStep } from '    updatere  cresoimin  updatere  cresoimportn import { AlertCircle } from 'lucide-    updat.im  import {  [cimport { FilesStep } from './steps/FilesStep';
im  impo  im  import { ReviewStep } from './steps/ReviewS  type San[cimport { FilesStep } from './steps/FilesStep';n im  import {  [cimport { FilesStep } from 'arim  impo  im  import { ReviewStep } from './steps/ReviewS  ty  
im  importicim  import {  [cimport { FilesStep } from './stpyim  impo  im  import { ReviewStep } from './steps/Revol  getSubmissionById,
  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cresoimportn import { AlertCircle } from 'lucide-   'E  updatere  cresoimportn import { AlertCircle } from 'lucide-    upda  im  impo  im  import { ReviewStep } from './steps/ReviewS  type San[cimport { FilesStep } from './steps/FilesStep';n im  import {  [cimport { FilesStep } from 'arim  impo  im  import { ReviewStep } from './steps/ReviewS  ty  
im  importicim  import {  [cimport { FilesStep } from './stpyim  impo  im  import { ReviewStep } from './steps/Revol  getSubmissionByIErim  importicim  import {  [cimport { FilesStep } from './stpyim  impo  im  import { ReviewStep } from './steps/Revol  getSubmissionById,
  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCircle }  ad  updatere  cresoimportn import { AlertCircle } from 'lucide-   'E  updatere  cresoimportcoim  importicim  import {  [cimport { FilesStep } from './stpyim  impo  im  import { ReviewStep } from './steps/Revol  getSubmissionByIErim  importicim  import {  [cimport { FilesStep } from './stpyim  impo  im  import { ReviewStep } from './steps/Revol  getSubmissionById,
  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cress)   updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn (e  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S     updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz in  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cress)   updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn (e  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S     updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclfou  updatere  cress)   updatere  cresoimportn import { AlertCircle }  Sco  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,.l  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz [.  updatere  cress)   updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn (e  updatere  cresss  updatere  cresoimportn import mi  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById, m  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz f   updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn (e  updatere  cresss  updatere  cresoimportn import mi  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById, m  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz f   updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById,
  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf  re  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz <d  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn (e  updatere  cresss  updatere  cresoimportn import mi  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById, m  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz f   updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionByIdin  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf  re  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz <d  updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn import { AlertCirclf   updatere  creso tar -tzf backups/backup_20260128_213839.tar.gz  updatere  cresoimportn (e  updatere  cresss  updatere  cresoimportn import mi  updatere  cresss  updatere  cresoimportn import { AlertCircle }  S  getSubmissionById, m  updatere  creso rd={handleAddKeyword}
            onRemoveKeyword={handleRemoveKeyword}
            onCancel={() => navigate('/dashboard')}
            onSave={handleSaveManuscriptDetails}
          />
        )}

        {currentStep === 3 && (
          <FilesStep
            uploadingFile={uploadingFile}
            submission={submission}
            onBack={() => setCurrentStep(2)}
            onProceed={handleProceedToReview}
            onUpload={(file, kind) => void handleFileUpload(file, kind)}
          />
        )}

        {currentStep === 4 && (
          <ReviewStep
            saving={saving}
            manuscriptData={manuscriptData}
            submission={submission}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleGoToDetail}
          />
        )}
      </div>
    </div>
  );
}
