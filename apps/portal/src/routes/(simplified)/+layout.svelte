<script>
    import { APP_NAME } from "$lib/config";


</script>

<div class="py-2 px-4 container mx-auto">
  <a href="/">logo</a>
</div>

<div class="py-2 px-4 container mx-auto">
  <slot></slot>
</div>

<div class="py-2 px-4 container mx-auto mt-auto text-insights-gray-50 text-sm flex">
  <div>
    &copy; {new Date().getFullYear()} {APP_NAME}
  </div>
  <div class="ml-auto">
    <a href="/legal/privacy" class="text-insights-gray-50 pr-3">
      Privacy Policy
    </a>
    <a href="/legal/legal-regulatory" class="text-insights-gray-50 pr-3">
      Legal &amp; Regulatory
    </a>
    <a href="/legal/terms" class="text-insights-gray-50 ">
      Terms &amp; Conditions
    </a>
  </div>
</div>
