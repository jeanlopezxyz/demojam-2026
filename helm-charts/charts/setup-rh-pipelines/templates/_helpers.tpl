{{/*
Expand the name of the chart.
*/}}
{{- define "setup-rh-pipelines.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "setup-rh-pipelines.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "setup-rh-pipelines.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "setup-rh-pipelines.labels" -}}
helm.sh/chart: {{ include "setup-rh-pipelines.chart" . }}
{{ include "setup-rh-pipelines.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: pipelines-setup
app.kubernetes.io/part-of: demojam-platform
{{- end }}

{{/*
Selector labels
*/}}
{{- define "setup-rh-pipelines.selectorLabels" -}}
app.kubernetes.io/name: {{ include "setup-rh-pipelines.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "setup-rh-pipelines.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "setup-rh-pipelines.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the namespace to use
*/}}
{{- define "setup-rh-pipelines.namespace" -}}
{{- default .Release.Namespace .Values.namespace }}
{{- end }}