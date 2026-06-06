import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import 'press_button.dart';

class OtpModal extends StatefulWidget {
  final String email;
  final VoidCallback onClose;
  final VoidCallback? onVerified;

  const OtpModal({
    super.key,
    required this.email,
    required this.onClose,
    this.onVerified,
  });

  @override
  State<OtpModal> createState() => _OtpModalState();
}

class _OtpModalState extends State<OtpModal>
    with SingleTickerProviderStateMixin {
  static const int _length = 5;

  final List<TextEditingController> _controllers =
      List.generate(_length, (_) => TextEditingController());
  final List<FocusNode> _focusNodes =
      List.generate(_length, (_) => FocusNode());

  // Track which inputs are unlocked — only first is enabled initially
  final List<bool> _unlocked = [true, false, false, false, false];

  bool _loading   = false;
  bool _verified  = false;
  String? _errorMsg;

  late final AnimationController _cardCtrl;
  late final Animation<double>   _cardScale;
  late final Animation<double>   _backdropAnim;

  @override
  void initState() {
    super.initState();

    _cardCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 340),
    );
    _cardScale = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOutBack),
    );
    _backdropAnim = CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOut);

    _cardCtrl.forward();

    // Focus first input after frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  @override
  void dispose() {
    _cardCtrl.dispose();
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  // ── OTP logic ─────────────────────────────────────────────────────────

  void _onDigitChanged(int index, String value) {
    setState(() => _errorMsg = null);

    if (value.length == 1) {
      // Digit entered: unlock and focus next
      if (index < _length - 1) {
        if (!_unlocked[index + 1]) {
          setState(() => _unlocked[index + 1] = true);
        }
        _focusNodes[index + 1].requestFocus();
      } else {
        // Last box filled — dismiss keyboard
        _focusNodes[index].unfocus();
      }
    } else if (value.isEmpty) {
      // Deleted: re-lock this box and move back
      if (index > 0) {
        setState(() => _unlocked[index] = false);
        _controllers[index].clear();
        _focusNodes[index - 1].requestFocus();
      }
    }

    setState(() {});
  }

  bool get _allFilled => _controllers.every((c) => c.text.isNotEmpty);

  String get _otpValue =>
      _controllers.map((c) => c.text).join();

  Future<void> _onVerify() async {
    if (!_allFilled) return;
    setState(() {
      _loading  = true;
      _errorMsg = null;
    });

    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;

    // Simulate: "123456" is valid — anything else fails for demo
    if (_otpValue == '12345') {
      setState(() {
        _loading  = false;
        _verified = true;
      });
      await Future.delayed(const Duration(milliseconds: 800));
      widget.onVerified?.call();
    } else {
      setState(() {
        _loading  = false;
        _errorMsg = 'Incorrect code. Please try again.';
      });
      // Shake the inputs
      for (final c in _controllers) c.clear();
      for (int i = 1; i < _length; i++) {
        _unlocked[i] = false;
      }
      _focusNodes[0].requestFocus();
    }
  }

  // ── UI ─────────────────────────────────────────────────────────────────

  Widget _buildOtpBox(int index) {
    final enabled    = _unlocked[index];
    final filled     = _controllers[index].text.isNotEmpty;
    final isFocused  = _focusNodes[index].hasFocus;
    final hasError   = _errorMsg != null;

    Color borderColor;
    if (hasError && filled) {
      borderColor = AppColors.error;
    } else if (isFocused) {
      borderColor = AppColors.accent;
    } else if (filled) {
      borderColor = AppColors.accentDim;
    } else {
      borderColor = AppColors.cardBorder;
    }

    return ListenableBuilder(
      listenable: Listenable.merge([_focusNodes[index], _controllers[index]]),
      builder: (_, __) {
        return GestureDetector(
          onTap: enabled ? () => _focusNodes[index].requestFocus() : null,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            width: 52,
            height: 58,
            decoration: BoxDecoration(
              color: enabled ? AppColors.card : AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: borderColor,
                width: isFocused || (hasError && filled) ? 1.5 : 1,
              ),
              boxShadow: isFocused
                  ? [
                      BoxShadow(
                        color: AppColors.accent.withOpacity(0.2),
                        blurRadius: 12,
                        spreadRadius: 0,
                      ),
                    ]
                  : null,
            ),
            child: Stack(
              children: [
                // Hidden actual input
                Positioned.fill(
                  child: Opacity(
                    opacity: 0,
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      enabled: enabled && !_loading,
                      keyboardType: TextInputType.number,
                      textInputAction: index < _length - 1
                          ? TextInputAction.next
                          : TextInputAction.done,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(1),
                      ],
                      onChanged: (v) => _onDigitChanged(index, v),
                      onSubmitted: (_) {
                        if (index < _length - 1 && _unlocked[index + 1]) {
                          _focusNodes[index + 1].requestFocus();
                        } else if (_allFilled) {
                          _onVerify();
                        }
                      },
                      decoration: const InputDecoration(border: InputBorder.none),
                    ),
                  ),
                ),
                // Visible display
                Center(
                  child: Text(
                    _controllers[index].text.isNotEmpty
                        ? '•'
                        : '',
                    style: GoogleFonts.inter(
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      color: hasError
                          ? AppColors.error
                          : AppColors.accent,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _backdropAnim,
      child: Material(
        color: AppColors.overlay,
        child: GestureDetector(
          onTap: () {}, // absorb taps on backdrop (don't close)
          child: SafeArea(
            child: Center(
              child: ScaleTransition(
                scale: _cardScale,
                child: GestureDetector(
                  onTap: () {}, // don't propagate
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 24),
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.cardBorder),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.6),
                          blurRadius: 48,
                          offset: const Offset(0, 16),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // ── Header row ─────────────────────────────────
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Logo mark
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                gradient: AppColors.logoGradient,
                                borderRadius: BorderRadius.circular(11),
                              ),
                              child: const Icon(Icons.restaurant,
                                  color: Colors.white, size: 19),
                            ),
                            const Spacer(),
                            // Close button
                            GestureDetector(
                              onTap: widget.onClose,
                              child: Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.cardBorder),
                                ),
                                child: Icon(
                                  Icons.close,
                                  size: 16,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // ── Title ──────────────────────────────────────
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            _verified ? 'Verified!' : 'Enter your code',
                            style: GoogleFonts.inter(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.8,
                              color: _verified
                                  ? AppColors.success
                                  : AppColors.textPrimary,
                            ),
                          ),
                        ),

                        const SizedBox(height: 8),

                        Align(
                          alignment: Alignment.centerLeft,
                          child: RichText(
                            text: TextSpan(
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                height: 1.5,
                                color: AppColors.textSecondary,
                              ),
                              children: [
                                const TextSpan(
                                    text: 'We sent a 5-digit code to '),
                                TextSpan(
                                  text: widget.email,
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 28),

                        // ── OTP inputs ─────────────────────────────────
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(
                            _length,
                            (i) => _buildOtpBox(i),
                          ),
                        ),

                        // ── Error ──────────────────────────────────────
                        AnimatedSize(
                          duration: const Duration(milliseconds: 200),
                          curve: Curves.easeOut,
                          child: _errorMsg != null
                              ? Padding(
                                  padding: const EdgeInsets.only(top: 14),
                                  child: Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 14, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: AppColors.errorDim,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                          color: AppColors.error
                                              .withOpacity(0.25)),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.error_outline,
                                            size: 14,
                                            color: AppColors.error
                                                .withOpacity(0.8)),
                                        const SizedBox(width: 8),
                                        Text(
                                          _errorMsg!,
                                          style: GoogleFonts.inter(
                                            fontSize: 13,
                                            color: AppColors.error
                                                .withOpacity(0.9),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                              : const SizedBox.shrink(),
                        ),

                        const SizedBox(height: 24),

                        // ── Verify button ──────────────────────────────
                        _verified
                            ? Container(
                                width: double.infinity,
                                height: 52,
                                decoration: BoxDecoration(
                                  color: AppColors.success.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                      color:
                                          AppColors.success.withOpacity(0.3)),
                                ),
                                alignment: Alignment.center,
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.check_circle_outline,
                                        color: AppColors.success, size: 20),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Account created',
                                      style: GoogleFonts.inter(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.success,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : AnimatedOpacity(
                                opacity: _allFilled ? 1.0 : 0.45,
                                duration: const Duration(milliseconds: 200),
                                child: IgnorePointer(
                                  ignoring: !_allFilled,
                                  child: _buildVerifyButton(),
                                ),
                              ),

                        const SizedBox(height: 20),

                        // ── Resend ──────────────────────────────────────
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Didn't receive it? ",
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                // Reset and resend
                                for (final c in _controllers) c.clear();
                                for (int i = 1; i < _length; i++) {
                                  _unlocked[i] = false;
                                }
                                setState(() => _errorMsg = null);
                                _focusNodes[0].requestFocus();
                              },
                              child: Text(
                                'Resend code',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.accent,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVerifyButton() {
    return PressButton(
      onTap: _allFilled && !_loading ? _onVerify : null,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppColors.accentGradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: _allFilled
              ? [
                  BoxShadow(
                    color: AppColors.accent.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        alignment: Alignment.center,
        child: _loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : Text(
                'Verify Code',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  letterSpacing: -0.1,
                ),
              ),
      ),
    );
  }
}
