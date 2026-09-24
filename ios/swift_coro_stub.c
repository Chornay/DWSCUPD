#include <stdlib.h>

// Stub for _swift_coroFrameAlloc missing in older deployment targets
void* swift_coroFrameAlloc(unsigned long size) {
    return malloc(size);
}
